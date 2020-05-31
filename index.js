document.addEventListener('DOMContentLoaded', function() {
    const formEl = document.getElementById('vedioForm');
    const listOfRequestsEl = document.getElementById('listOfRequests');
    const searchBoxEl = document.getElementById('search');

    getAllVideoRequests(listOfRequestsEl, null, null);

    formEl.addEventListener('submit', function(e) {
        e.preventDefault();
    
        createVedioRequest(formEl)
            .then(response => response.json())
            .then(videoInfo => {
                if (videoInfo) {
                    listOfRequestsEl.innerHTML = setVedioRequesTemplate(videoInfo) + listOfRequestsEl.innerHTML;
                }
            })
            .catch(err => {
                console.log(err);
            });
    });

    searchBoxEl.addEventListener('input', function(e) {
        getAllVideoRequests(listOfRequestsEl, null, e.target.value);
    });

});

function sortByNew(btn) {
    btn.classList.add('active');
    document.getElementById('sort_by_top').classList.remove('active');
    const listOfRequestsEl = document.getElementById('listOfRequests');
    getAllVideoRequests(listOfRequestsEl, null, null);
}

function sortByTopVoted(btn) {
    btn.classList.add('active');
    document.getElementById('sort_by_new').classList.remove('active');
    const listOfRequestsEl = document.getElementById('listOfRequests');
    getAllVideoRequests(listOfRequestsEl, 'topVotedFirst', null);
}

function voteUp(videoInfo){
    const id = videoInfo.id.split('_')[2];
    voteForVideo(id, 'ups')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setVoteScore(data);
        })
        .catch(err => console.log(err));
}

function voteDown(videoInfo){
    const id = videoInfo.id.split('_')[2];
    voteForVideo(id, 'downs')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setVoteScore(data);
        })
        .catch(err => console.log(err));
}

function setVoteScore(videoInfo){
    const scoreEl = document.getElementById('score_' + videoInfo._id);
    scoreEl.innerText = videoInfo.votes.ups - videoInfo.votes.downs
}

function getAllVideoRequests(listOfRequestsEl, sortBy, searchTerm) {
    getAllVedios(sortBy, searchTerm)
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            listOfRequestsEl.innerHTML = '';
            data.forEach(videoInfo => {
                if (videoInfo) {
                    listOfRequestsEl.innerHTML += setVedioRequesTemplate(videoInfo);
                }
            });
        }
    })
    .catch(err => {
        console.log(err);
    });
}

function setVedioRequesTemplate(videoInfo) {
    return (`
        <div class="card mb-3">
            <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
                <h3>${videoInfo.topic_title}</h3>
                <p class="text-muted mb-2">${videoInfo.topic_details}</p>
                <p class="mb-0 text-muted">
                ${videoInfo.expected_result ? '<strong>Expected results: </strong>' + videoInfo.expected_result : ''}
                </p>
            </div>
            <div class="d-flex flex-column text-center">
                <a id="vote_ups_${videoInfo._id}" onclick="voteUp(this)" class="btn btn-link">🔺</a>
                <h3 id="score_${videoInfo._id}">${videoInfo.votes.ups - videoInfo.votes.downs}</h3>
                <a id="vote_downs_${videoInfo._id}" onclick="voteDown(this)" class="btn btn-link">🔻</a>
            </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
            <div>
                <span class="text-info">${videoInfo.status ? videoInfo.status.toUpperCase() : ''}</span>
                &bullet; added by <strong>${videoInfo.author_name}</strong> on
                <strong>${(new Date(videoInfo.submit_date)).toDateString()}</strong>
            </div>
            <div
                class="d-flex justify-content-center flex-column 408ml-auto mr-2"
            >
                <div class="badge badge-success">
                ${videoInfo.target_level}
                </div>
            </div>
            </div>
        </div>
    `);
}