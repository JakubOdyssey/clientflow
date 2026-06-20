/*
*
* Contact JS
* @ThemeEaster
* Updated for ClientFlow lead tracking
*
*/
$(function() {
    // Get the form.
    var form = $('#ajax_contact');

    // Get the messages div.
    var formMessages = $('#form-messages');

    // Track successful lead submission in Google Analytics.
    // This only runs if the visitor accepted optional cookies
    // and Google Analytics has been loaded.
    function trackLeadSubmit() {
        if (typeof window.gtag === "function") {
            window.gtag("event", "lead_submit", {
                event_category: "lead",
                event_label: "contact_form",
                form_name: "ClientFlow contact form",
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    // Set up an event listener for the contact form.
    $(form).submit(function(event) {
        // Stop the browser from submitting the form.
        event.preventDefault();

        // Serialize the form data.
        var formData = $(form).serialize();

        // Submit the form using AJAX.
        $.ajax({
            type: 'POST',
            url: $(form).attr('action'),
            data: formData
        })
        .done(function(response) {
            // Make sure that the formMessages div has the 'success' class.
            $(formMessages).removeClass('alert-danger');
            $(formMessages).addClass('alert-success');

            // Set the message text.
            $(formMessages).text(response);

            // Track successful lead submission.
            trackLeadSubmit();

            // Clear the form.
            $('#fullname').val('');
            $('#email').val('');
            $('#phone').val('');
            $('#message').val('');
        })
        .fail(function(data) {
            // Make sure that the formMessages div has the 'error' class.
            $(formMessages).removeClass('alert-success');
            $(formMessages).addClass('alert-danger');

            // Set the message text.
            if (data.responseText !== '') {
                $(formMessages).text(data.responseText);
            } else {
                $(formMessages).text('Oops! An error occurred and your message could not be sent.');
            }
        });

    });

});