const SUPER_USER_ID = "5f4d4de59a64e34a145b2e43";

let state = {
  sortBy: "",
  searchTerm: "",
  filterBy: "all",
  user_id: "",
  isAdmin: false
};

document.addEventListener("DOMContentLoaded", function() {
  const formEl = document.getElementById("vedioForm");
  const listOfRequestsEl = document.getElementById("listOfRequests");
  const adminFilterGroupElm = document.getElementById("admin_filter_group");
  const searchBoxEl = document.getElementById("search");
  const loginFormEl = document.querySelector(".login-form");
  const appContentEl = document.querySelector(".app-content");

  if (window.location.search) {
    state.user_id = new URLSearchParams(window.location.search).get("id");
    if (state.user_id) {
      loginFormEl.classList.add("d-none");
      appContentEl.classList.remove("d-none");
      state.isAdmin = state.user_id === SUPER_USER_ID;
      if (state.isAdmin) {
        // const vedioActionsElm = document.getElementById("video_action");
        if (adminFilterGroupElm.classList.contains('d-none')) {
          adminFilterGroupElm.classList.remove('d-none');
        }
        formEl.classList.add("d-none");
        // vedioActionsElm.classList.add("d-none");
      } else {
        if (!adminFilterGroupElm.classList.contains('d-none')) {
          adminFilterGroupElm.classList.add('d-none');
        }
      }
    }
  }

  // get All Vedios
  getAllVideoRequests(listOfRequestsEl, null, null, state.filterBy);

  // Submit vedio request
  submitVedioRequest(formEl, listOfRequestsEl);

  // search for vedio request
  searchForVedioRequest(searchBoxEl, listOfRequestsEl);
});

function submitVedioRequest(formEl, listOfRequestsEl) {
  formEl.addEventListener("submit", function(e) {
    e.preventDefault();

    if (!validateForm(formEl)) return;

    createVedioRequest(formEl, state.user_id)
      .then(response => response.json())
      .then(videoInfo => {
        if (videoInfo) {
          listOfRequestsEl.innerHTML =
            setVedioRequesTemplate(videoInfo) + listOfRequestsEl.innerHTML;
        }
      })
      .catch(err => {});
  });
}

function searchForVedioRequest(searchBoxEl, listOfRequestsEl) {
  searchBoxEl.addEventListener(
    "input",
    debounce(e => {
      e.preventDefault();
      state.searchTerm = e.target.value ? e.target.value.trim() : "";
      getAllVideoRequests(listOfRequestsEl, state.sortBy, state.searchTerm, state.filterBy);
    }, 500)
  );
}

function sortByNew(btn) {
  btn.classList.add("active");
  document.getElementById("sort_by_top").classList.remove("active");
  const listOfRequestsEl = document.getElementById("listOfRequests");
  state.sortBy = "";
  getAllVideoRequests(listOfRequestsEl, null, state.searchTerm, state.filterBy);
}

function sortByTopVoted(btn) {
  btn.classList.add("active");
  document.getElementById("sort_by_new").classList.remove("active");
  const listOfRequestsEl = document.getElementById("listOfRequests");
  state.sortBy = "topVotedFirst";
  getAllVideoRequests(listOfRequestsEl, "topVotedFirst", state.searchTerm, state.filterBy);
}

function voteUp(videoInfo, isDisabled = false) {
  if (isDisabled) return;
  const id = videoInfo.id.split("_")[2];
  voteForVideo(id, "ups", state.user_id)
    .then(response => response.json())
    .then(data => {
      setVoteScore(data, "ups");
    })
    .catch(err => console.log(err));
}

function voteDown(videoInfo, isDisabled = false) {
  if (isDisabled) return;
  const id = videoInfo.id.split("_")[2];
  voteForVideo(id, "downs", state.user_id)
    .then(response => response.json())
    .then(data => {
      setVoteScore(data, "downs");
    })
    .catch(err => console.log(err));
}

function setVoteScore(videoInfo, vote_type) {
  const scoreEl = document.querySelector(`[id^=score][id$=_${videoInfo._id}]`);
  scoreEl.innerText = videoInfo.votes.ups.length - videoInfo.votes.downs.length;
  setArrowsStyle(videoInfo, videoInfo.status && videoInfo.status.toLowerCase() === 'done', vote_type);
}

function setArrowsStyle(videoInfo, isDisabled, vote_type = null) {
  const voteUpBtnElm = document.getElementById(`vote_ups_${videoInfo._id}`);
  const voteDownBtnElm = document.getElementById(`vote_downs_${videoInfo._id}`);
  const voteDirElm = vote_type === "ups" ? voteUpBtnElm : voteDownBtnElm;
  const otherDirElm = vote_type === "ups" ? voteDownBtnElm : voteUpBtnElm;

  if (isDisabled) {
    voteUpBtnElm.style.opacity = "0.5";
    voteUpBtnElm.style.cursor = "not-allowed";
    voteDownBtnElm.style.opacity = "0.5";
    voteDownBtnElm.style.cursor = "not-allowed";
    return;
  }

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

function getAllVideoRequests(listOfRequestsEl, sortBy, searchTerm, filterBy = 'all') {
  getAllVedios(sortBy, searchTerm, filterBy)
    .then(response => response.json())
    .then(data => {
      listOfRequestsEl.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach(videoInfo => {
          if (videoInfo) {
            listOfRequestsEl.innerHTML += setVedioRequesTemplate(videoInfo);
            setArrowsStyle(videoInfo, videoInfo.status && videoInfo.status.toLowerCase() === 'done' || state.isAdmin);
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function setVedioRequesTemplate(videoInfo) {
  return `
      <div class="card mb-3">
        ${
          state.isAdmin
            ? `
        <div class="card-header d-flex justify-content-between">
          <select id="admin_change_status_${
            videoInfo._id
          }" onChange="onStatusChange(this)">
            <option value="new">new</option>
            <option value="planned">planned</option>
            <option value="done">done</option>
          </select>
          <div class="input-group ml-2 mr-5 ${
            videoInfo.status.toLowerCase() !== "done" ? "d-none" : ""
          }" id="admin_link_container_${videoInfo._id}">
            <input type="text" class="form-control" placeholder="Paste here Youtube vedio link" id="admin_link_input_${
              videoInfo._id
            }" required value="${videoInfo.video_ref.link}">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" type="button" id="admin_save_${
                videoInfo._id
              }" onclick="addLink(this)">Save</button>
            </div>
          </div>
          <button class="btn btn-danger" type="button" id="admin_delete_${
            videoInfo._id
          }" onclick="adminDelete(this)">Delete</button>
        </div>`
            : ""
        }
        <div class="card-body d-flex justify-content-between flex-row">
          <div class="d-flex flex-column">
              <h3>${videoInfo.topic_title}</h3>
              <p class="text-muted mb-2">${videoInfo.topic_details}</p>
              <p class="mb-0 text-muted">
              ${
                videoInfo.expected_result
                  ? "<strong>Expected results: </strong>" +
                    videoInfo.expected_result
                  : ""
              }
              </p>
          </div>
          ${
            videoInfo.status && videoInfo.status.toLowerCase() === "done"
              ? `<div class="ml-auto mr-3">
                 <iframe src="http://www.youtube.com/embed/${videoInfo.video_ref.link}" frameborder="0" allowfullscreen width="240" height="135"></iframe>   
                </div>` : ""
          }
          <div class="d-flex flex-column text-center">
              <a id="vote_ups_${
                videoInfo._id
              }" onclick="voteUp(this, ${state.isAdmin || (videoInfo.status && videoInfo.status.toLowerCase() === 'done')})" class="btn btn-link">🔺</a>
              <h3 id="score_${videoInfo._id}">${videoInfo.votes.ups.length -
    videoInfo.votes.downs.length}</h3>
              <a id="vote_downs_${
                videoInfo._id
              }" onclick="voteDown(this, ${state.isAdmin || (videoInfo.status && videoInfo.status.toLowerCase() === 'done')})" class="btn btn-link">🔻</a>
          </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
          <div class="${
            videoInfo.status && videoInfo.status.toLowerCase() === "done"
              ? "text-success"
              : videoInfo.status && videoInfo.status.toLowerCase() === "planned"
              ? "text-primary"
              : ""
          }">
              <span>${
                videoInfo.status ? videoInfo.status.toUpperCase() : ""
              } on ${new Date(videoInfo.video_ref.date).toDateString()}</span>
              &bullet; added by <strong>${videoInfo.author_name}</strong> on
              <strong>${new Date(videoInfo.submit_date).toDateString()}</strong>
          </div>
          <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
              <div class="badge badge-success">
              ${videoInfo.target_level}
              </div>
          </div>
          </div>
      </div>
  `;
}

function debounce(fn, time) {
  let timeout;

  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), time);
  };
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

function adminSave(videoObj) {
  const listOfRequestsEl = document.getElementById("listOfRequests");

  updateVedioRequest(videoObj).then(value => {
    // get All Vedios
    getAllVideoRequests(listOfRequestsEl, state.sortBy, state.searchTerm, state.filterBy);
  });
}

function addLink(elm) {
  const videoId = elm.id.split("_")[2];
  const linkInputElm = document.querySelector(
    `[id^=admin_link_input][id$=_${videoId}]`
  );

  if (!linkInputElm.value) {
    linkInputElm.classList.add("is-invalid");
    linkInputElm.addEventListener("input", function() {
      linkInputElm.classList.remove("is-invalid");
    });
    return;
  }

  adminSave({ id: videoId, resVideo: linkInputElm.value, status: "done" });
}

function adminDelete(elm) {
  const listOfRequestsEl = document.getElementById("listOfRequests");
  const videoId = elm.id.split("_")[2];
  deleteVedioRequest({ id: videoId }).then(value => {
    // get All Vedios
    getAllVideoRequests(listOfRequestsEl, state.sortBy, state.searchTerm, state.filterBy);
  });
}

function onStatusChange(selectElm) {
  const videoId = selectElm.id.split("_")[3];
  const adminLinkContainer = document.getElementById(
    `admin_link_container_${videoId}`
  );
  if (selectElm.value === "done") {
    if (adminLinkContainer.classList.contains("d-none")) {
      adminLinkContainer.classList.remove("d-none");
    }
  } else {
    if (!adminLinkContainer.classList.contains("d-none")) {
      adminLinkContainer.classList.remove("d-none");
    }
    adminSave({ id: videoId, status: selectElm.value });
  }
}

function filter(elm, type) {
  state.filterBy = type;
  const children = elm.parentElement.children;
  const listOfRequestsEl = document.getElementById("listOfRequests");

  for (const child of children) {
    child.classList.remove('active');
  }
  elm.classList.add('active')
  // get All Vedios
  getAllVideoRequests(listOfRequestsEl, state.sortBy, state.searchTerm, state.filterBy);
}
