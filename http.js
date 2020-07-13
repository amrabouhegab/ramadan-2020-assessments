
function createVedioRequest(form) {
    const url = 'http://localhost:7777/video-request';
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

function getAllVedios(sortBy, searchTerm) {
    let url = `http://localhost:7777/video-request?sortBy=${sortBy ? sortBy : ''}`;
    if (searchTerm) {
        url += `&searchTerm=${searchTerm}`;
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


function login(body) {
    const url = 'http://localhost:7777/users/login';

    const loginData ={
        author_email: body.email,
        author_name: body.name
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}

function signUp(body) {
    const url = 'http://localhost:7777/users/login';

    const loginData ={
        author_email: body.email,
        author_name: body.name
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}
