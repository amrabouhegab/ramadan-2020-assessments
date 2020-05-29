
function createVedioRequest(form) {
    const url = 'http://localhost:7777/video-request';
    const body = {
        author_name: form.elements.author_name.value,
        author_email: form.elements.author_email.value,
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

function getAllVedios(form) {
    const url = 'http://localhost:7777/video-request';

    return fetch(url, {
        method: 'GET'
    });
}

