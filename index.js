document.addEventListener('DOMContentLoaded', function() {
    const formEl = document.getElementById('vedioForm');
    const listOfRequestsEl = document.getElementById('listOfRequests');

    getAllVedios(formEl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                data.forEach(vedioInfo => {
                    if (vedioInfo) {
                        listOfRequestsEl.innerHTML += setVedioRequesTemplate(vedioInfo);
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
        });

    formEl.addEventListener('submit', function(e) {
        e.preventDefault();
    
        createVedioRequest(formEl)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.log(err);
            });
    });

});



function setVedioRequesTemplate(vedioInfo) {
    return (`
        <div class="card mb-3">
            <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
                <h3>${vedioInfo.topic_title}</h3>
                <p class="text-muted mb-2">${vedioInfo.topic_details}</p>
                <p class="mb-0 text-muted">
                <strong>Expected results:</strong> ${vedioInfo.expected_result}
                </p>
            </div>
            <div class="d-flex flex-column text-center">
                <a class="btn btn-link">🔺</a>
                <h3>${vedioInfo.votes.ups - vedioInfo.votes.downs}</h3>
                <a class="btn btn-link">🔻</a>
            </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
            <div>
                <span class="text-info">${vedioInfo.status.toUpperCase()}</span>
                &bullet; added by <strong>${vedioInfo.author_name}</strong> on
                <strong>${(new Date(vedioInfo.submit_date)).toDateString()}</strong>
            </div>
            <div
                class="d-flex justify-content-center flex-column 408ml-auto mr-2"
            >
                <div class="badge badge-success">
                ${vedioInfo.target_level}
                </div>
            </div>
            </div>
        </div>
    `);
}
