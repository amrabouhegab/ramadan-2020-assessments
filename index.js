// let searchTerm = '';
// let user_id = '';

let state = {
  sortBy: '',
  searchTerm: '',
  user_id: ''
}
document.addEventListener('DOMContentLoaded', function() {
    const formEl = document.getElementById('vedioForm');
    const listOfRequestsEl = document.getElementById('listOfRequests');
    const searchBoxEl = document.getElementById('search');
    const loginFormEl = document.querySelector('.login-form');
    const appContentEl = document.querySelector('.app-content');


  if (window.location.search) {
    state.user_id = new URLSearchParams(window.location.search).get("id");
    if (state.user_id) {
      loginFormEl.classList.add("d-none");
      appContentEl.classList.remove("d-none");
    }
  }

    // get All Vedios
    getAllVideoRequests(listOfRequestsEl, null, null);

    // Submit vedio request
    submitVedioRequest(formEl, listOfRequestsEl);

    // search for vedio request
    searchForVedioRequest(searchBoxEl, listOfRequestsEl);

});

function submitVedioRequest(formEl, listOfRequestsEl) {
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm(formEl))
      return;

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
}

function searchForVedioRequest(searchBoxEl, listOfRequestsEl) {
  searchBoxEl.addEventListener('input', debounce((e) => {
    e.preventDefault();
    state.searchTerm = e.target.value ? e.target.value.trim() : '';
    getAllVideoRequests(listOfRequestsEl, state.sortBy, state.searchTerm);
  }, 500));
}

function loginFn(signInBtnEl, signInFormEl) {
  signInBtnEl.addEventListener('click', (e) => {
    e.preventDefault();

    if (!validateLoginForm(signInFormEl))
      return;

    const name = signInFormEl.userName.value;
    const email = signInFormEl.email.value;
    const body = {
      name,
      email
    };
    console.log('body', body);
    login(body).then(val => {
      console.log('val', val);
    });
  });
}

function signUpFn(signUpBtnEl, signInFormEl) {
  signUpBtnEl.addEventListener("click", e => {
    e.preventDefault();

    if (!validateLoginForm(signInFormEl))
      return;

    console.log(signInFormEl);
    const name = signInFormEl.userName.value;
    const email = signInFormEl.email.value;
    const body = {
      name,
      email
    };
    console.log("body", body);
  });
}

function sortByNew(btn) {
    btn.classList.add('active');
    document.getElementById('sort_by_top').classList.remove('active');
    const listOfRequestsEl = document.getElementById('listOfRequests');
    state.sortBy = '';
    getAllVideoRequests(listOfRequestsEl, null, state.searchTerm);
}

function sortByTopVoted(btn) {
  btn.classList.add("active");
  document.getElementById("sort_by_new").classList.remove("active");
  const listOfRequestsEl = document.getElementById("listOfRequests");
  state.sortBy = "topVotedFirst";
  getAllVideoRequests(listOfRequestsEl, "topVotedFirst", state.searchTerm);
}

function voteUp(videoInfo) {
  const id = videoInfo.id.split("_")[2];
  voteForVideo(id, "ups", state.user_id)
    .then(response => response.json())
    .then(data => {
      setVoteScore(data, "ups");
    })
    .catch(err => console.log(err));
}

function voteDown(videoInfo) {
  const id = videoInfo.id.split("_")[2];
  voteForVideo(id, "downs", state.user_id)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setVoteScore(data, "downs");
    })
    .catch(err => console.log(err));
}

function setVoteScore(videoInfo, vote_type){
    const scoreEl = document.querySelector(`[id^=score][id$=_${videoInfo._id}]`);
    scoreEl.innerText = videoInfo.votes.ups.length - videoInfo.votes.downs.length;
    setArrowsStyle(videoInfo, vote_type);
}

function setArrowsStyle(videoInfo, vote_type = null) {
  console.log('setArrowsStyle', videoInfo, vote_type);
  const voteUpBtnElm = document.getElementById(`vote_ups_${videoInfo._id}`);
  const voteDownBtnElm = document.getElementById(`vote_downs_${videoInfo._id}`);
  const voteDirElm = vote_type === "ups" ? voteUpBtnElm : voteDownBtnElm;
  const otherDirElm = vote_type === "ups" ? voteDownBtnElm : voteUpBtnElm;

  if (vote_type) {
    if (videoInfo.votes[vote_type].includes(state.user_id)) {
      voteDirElm.style.opacity = "0.5";
      otherDirElm.style.opacity = "1";
    } else {
      voteDirElm.style.opacity = "1";
      otherDirElm.style.opacity = "1";
    }
  } else {
    if (videoInfo.votes["ups"].includes(state.user_id)) {
      voteUpBtnElm.style.opacity = "0.5";
    }

    if (videoInfo.votes["downs"].includes(state.user_id)) {
      voteDownBtnElm.style.opacity = "0.5";
    }
  }
}

function getAllVideoRequests(listOfRequestsEl, sortBy, searchTerm) {
  getAllVedios(sortBy, searchTerm)
    .then(response => response.json())
    .then(data => {
      listOfRequestsEl.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach(videoInfo => {
          if (videoInfo) {
            listOfRequestsEl.innerHTML += setVedioRequesTemplate(videoInfo);
            setArrowsStyle(videoInfo);
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
              <h3 id="score_${videoInfo._id}">${videoInfo.votes.ups.length - videoInfo.votes.downs.length}</h3>
              <a id="vote_downs_${videoInfo._id}" onclick="voteDown(this)" class="btn btn-link">🔻</a>
          </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
          <div>
              <span class="text-info">${videoInfo.status ? videoInfo.status.toUpperCase() : ''}</span>
              &bullet; added by <strong>${videoInfo.author_name}</strong> on
              <strong>${(new Date(videoInfo.submit_date)).toDateString()}</strong>
          </div>
          <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
              <div class="badge badge-success">
              ${videoInfo.target_level}
              </div>
          </div>
          </div>
      </div>
  `);
}

function debounce(fn, time) {
    let timeout;

    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, arguments), time);
    }

}

function validateForm(form) {
  // const author_name = form.elements.author_name;
  // const author_email = form.elements.author_email;
  const topic_title = form.elements.topic_title;
  const target_level = form.elements.target_level;
  const topic_details = form.elements.topic_details;
  // const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // if (!author_name.value) {
  //   author_name.classList.add("is-invalid");
  // } else {
  //   author_name.classList.remove("is-invalid");
  // }
  // if (!author_email.value || !emailRegex.test(author_email.value)) {
  //   author_email.classList.add("is-invalid");
  // } else {
  //   author_email.classList.remove("is-invalid");
  // }

  if (
    !topic_title.value ||
    (topic_title.value && topic_title.value.length >= 100)
  ) {
    topic_title.classList.add("is-invalid");
  } else {
    topic_title.classList.remove("is-invalid");
  }

  if (!target_level.value) {
    target_level.classList.add("is-invalid");
  } else {
    target_level.classList.remove("is-invalid");
  }

  if (!topic_details.value) {
    topic_details.classList.add("is-invalid");
  } else {
    topic_details.classList.remove("is-invalid");
  }

  const invalidElms = document.querySelectorAll(".is-invalid");
  invalidElms.forEach(elm => {
    elm.addEventListener("input", function() {
      this.classList.remove("is-invalid");
    });
  });

  return !invalidElms.length;
}

function validateLoginForm(form) {
  const name = form.userName;
  const email = form.email;
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!name.value) {
    name.classList.add("is-invalid");
  } else {
    name.classList.remove("is-invalid");
  }

  if (!email.value || !emailRegex.test(email.value)) {
    email.classList.add("is-invalid");
  } else {
    email.classList.remove("is-invalid");
  }

  const invalidElms = document.querySelectorAll(".is-invalid");
  invalidElms.forEach(elm => {
    elm.addEventListener("input", function() {
      this.classList.remove("is-invalid");
    });
  });

  return !invalidElms.length;
}