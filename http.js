
function createVedioRequest(form, user_id) {
    const url = `http://localhost:7777/video-request?user_id=${user_id}`;
    const body = {
        // author_name: form.elements.author_name.value,
        // author_email: form.elements.author_email.value,
        topic_title: form.elements.topic_title.value,
        target_level: form.elements.target_level.value,
        topic_details: form.elements.topic_details.value,
        expected_result: form.elements.expected_result.value
    }

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}

function getAllVedios(sortBy, searchTerm, filterBy = '') {
    let url = `http://localhost:7777/video-request?sortBy=${sortBy ? sortBy : ''}`;
    if (searchTerm) {
        url += `&searchTerm=${searchTerm}`;
    }

    if (filterBy) {
        url += `&filterBy=${filterBy}`;
    }


    return fetch(url, {
        method: 'GET'
    });
}

function voteForVideo(id, type, user_id) {
    const url = 'http://localhost:7777/video-request/vote';

    const voteObj = {
        id: id,
        vote_type: type,
        user_id
    }

    return fetch(url, {
        method: 'PUT',
        body: JSON.stringify(voteObj),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}
function deleteVedioRequest(videoObj) {
    const url = 'http://localhost:7777/video-request';

    return fetch(url, {
        method: 'DELETE',
        body: JSON.stringify(videoObj),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}

function updateVedioRequest(videoObj) {
    console.log(videoObj);
    const url = 'http://localhost:7777/video-request';

    return fetch(url, {
        method: 'PUT',
        body: JSON.stringify(videoObj),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}
