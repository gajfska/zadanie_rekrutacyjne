import initInlineSVG from './inline-svg.js';

let allTeams = [];
let hasScrolled = false;
let dataLoaded = false;

document.addEventListener("DOMContentLoaded", () => {
    initInlineSVG();
    setupSearch();
    createSkeletons();
    setupSkeletonScroll();
});

// create 5 skeletons
function createSkeletons() {
  const container = document.getElementById('skeletonContainer');
  const skeletonHTML = `
    <div class="sceleton">
      <div class="sceleton__badge"></div>
      <div class="sceleton__team_main_info">
        <div class="sceleton__logo"></div>
        <div class="sceleton__team-name"></div>
      </div>
      <div class="sceleton__bottom">
        <div class="sceleton__charts">
          <div class="sceleton__chart-container" style="display:flex;align-items:center;gap:10px;">
            <div class="sceleton__chart"></div>
            <div class="sceleton__numbers"></div>
          </div>
        </div>
        <div class="sceleton__points"></div>
      </div>
    </div>
  `;

  for (let i = 0; i < 5; i++) {
    container.insertAdjacentHTML('beforeend', skeletonHTML);
  }
}

// skeleton on scroll
function setupSkeletonScroll() {
  $(window).on('scroll', function() {
    if (!hasScrolled) {
      hasScrolled = true;
      
      $('#skeletonContainer').addClass('fade-out');
      setTimeout(() => {
        if (!dataLoaded) {
          loadTeamsData();
        }
      }, 200);
    }
  });
}

// Search
const input = document.querySelector('.header__search-input');
const icon = document.querySelector('.header__search i');

input.addEventListener('input', () => {
  if (input.value.trim() !== '') {
    input.style.color = '#0f172a';
    input.style.borderColor = '#4a6cf7';
    icon.classList.remove('fa-search');
    icon.classList.add('fa-close');
    icon.style.color = '#4a6cf7';
  } else {
    input.style.borderColor = '';
    icon.classList.remove('fa-close');
    icon.classList.add('fa-search');
    icon.style.color = '';
  }
});


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

  const badgeClass = team.intRank <= 3 ? 'card__badge--top' : 'card__badge--other';

  const logoHtml = team.strBadge
  ? `<div class="card__logo" style="background-image: url(${team.strBadge})"></div>`
  : `<div class="card__logo"><i class="fa fa-soccer-ball-o"></i></div>`;

  
  return `
    <div class="card" data-team="${team.strTeam.toLowerCase()}">
      <div class="card__top">
        <div class="card__badge ${badgeClass}">${team.intRank}</div>
        <div class="card__team_main_info">
          ${logoHtml}
          <div class="card__team-name">${team.strTeam}</div>
        </div>
        <div class="card__charts">
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
  $('#noResultsMessage .no-results__text').text('There was a problem. Please try again later.');
  $('#noResultsMessage').show();

  $('#noResultsMessage i')
  .removeClass('fa-soccer-ball-o')  // remove the old icon
  .addClass('fa-exclamation'); 
  
  // Hide skeleton on error
  $('##skeletonContainer').addClass('fade-out');
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
        $('#skeletonContainer').remove();
      }, 500);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      showApiError();
      dataLoaded = false;
    });
}
