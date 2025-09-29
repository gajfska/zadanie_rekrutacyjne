import initInlineSVG from './inline-svg.js';

let allTeams = [];
let hasScrolled = false;
let dataLoaded = false;

document.addEventListener("DOMContentLoaded", () => {
    initInlineSVG();
    setupSearch();
    setupSkeletonScroll();
});

// Skeleton on scroll
function setupSkeletonScroll() {
  $(window).on('scroll', function() {
    if (!hasScrolled) {
      hasScrolled = true;
      
      $('.skeleton').addClass('fade-out');
      setTimeout(() => {
        if (!dataLoaded) {
          loadTeamsData();
        }
      }, 200);
    }
  });
}



// Search
function setupSearch() {
  const searchInput = $('#teamSearch');
  
  searchInput.on('input', function() {
    const searchTerm = $(this).val().toLowerCase().trim();
    filterTeams(searchTerm);
  });
}

function filterTeams(searchTerm) {
  if (searchTerm === '') {
    renderTeams(allTeams);
  } else {
    const filteredTeams = allTeams.filter(team => 
      team.strTeam.toLowerCase().startsWith(searchTerm)
    );
    renderTeams(filteredTeams, searchTerm);
  }
}

// Count chart
function createChart(team) {
  const total = parseInt(team.intWin) + parseInt(team.intDraw) + parseInt(team.intLoss);
  const winWidth = (parseInt(team.intWin) / total) * 340;
  const drawWidth = (parseInt(team.intDraw) / total) * 340;
  const lossWidth = (parseInt(team.intLoss) / total) * 340;
  
  // Reverse circle
  const formString = team.strForm || '';
  const formCircles = formString.split('').reverse().map(result => {
    let resultClass = '';
    switch(result) {
      case 'W': resultClass = 'win'; break;
      case 'L': resultClass = 'loss'; break;
      case 'D': resultClass = 'draw'; break;
    }
    return `<div class="circle ${resultClass}">${result}</div>`;
  }).join('');
  
  return `
    <div class="card" data-team="${team.strTeam.toLowerCase()}">
      <div class="card__top">
        <div class="card__badge">${team.intRank}</div>
        <div class="card__team_main_info">
          <div class="card__logo" style="background-image: url(${team.strBadge})"></div>
          <div class="card__team-name">${team.strTeam}</div>
        </div>
        <div class="charts">
          <div class="chart-container">
            <div class="chart">
              <div class="segment win" style="width: ${winWidth}px"></div>
              <div class="segment draw" style="width: ${drawWidth}px"></div>
              <div class="segment loss" style="width: ${lossWidth}px"></div>
            </div>
            <div class="numbers">
              <span class="win">W: ${team.intWin}</span>
              <span class="draw">D: ${team.intDraw}</span>
              <span class="loss">L: ${team.intLoss}</span>
            </div>
          </div>
        </div>
        <div class="card__points">${team.intPoints} PTK</div>
      </div>
      <div class="card__line"></div>
      <div class="card__bottom">
        <div class="form">
          <span class="form__label">Form:</span>
          <div class="form__circles">
            ${formCircles}
          </div>
        </div>
        <div class="stat goalsFor">Goals for: <span>${team.intGoalsFor}</span></div>
        <div class="stat goalsAgainst">Goals against: <span>${team.intGoalsAgainst}</span></div>
        <div class="stat goalsDiff">Goals difference: <span>${team.intGoalDifference}</span></div>
      </div>
    </div>
  `;
}

// Render teams
function renderTeams(teams, searchTerm = '') {
  $('main .card').remove();
  
  if (teams.length === 0) {
    // Show no results with text
    if (searchTerm) {
      $('#noResultsMessage .no-results__text').text(`No teams found matching "${searchTerm}"`);
    } 
    $('#noResultsMessage').show();
    return;
  } else {
    $('#noResultsMessage').hide();
  }
  
  // Render team chart
  teams.forEach(team => {
    const cardHtml = createChart(team);
    $('main').append(cardHtml);
  });
}

// Function to show API error
function showApiError() {
  $('main .card').remove();
  
  // Show API error message
  $('#noResultsMessage .no-results__text').text('There was a problem. Please try again later');
  $('#noResultsMessage').show();
  
  // Hide skeleton on error
  $('.skeleton').addClass('fade-out');
}

// API
function loadTeamsData() {
  if (dataLoaded) return;
  
  dataLoaded = true;
  
  $.get('https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4328&s=2024-2025')
    .then((data) => {
      allTeams = data.table;
      $('.card').remove();
      renderTeams(allTeams);
      
      // Remove skeleton
      setTimeout(() => {
        $('.skeleton').remove();
      }, 500);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      showApiError();
      dataLoaded = false;
    });
}
