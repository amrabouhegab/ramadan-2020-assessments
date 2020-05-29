document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('vedioForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    
        createVedioRequest(form)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.log(err);
            });
    });

});

