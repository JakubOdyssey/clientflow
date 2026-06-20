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

    // Prevent duplicate lead tracking on the same page load.
    var leadSubmitTracked = false;

    function trackLeadSubmit(source) {
        console.log("ClientFlow GA: trackLeadSubmit started from:", source);
        console.log("ClientFlow GA: gtag type is:", typeof window.gtag);

        if (leadSubmitTracked) {
            console.log("ClientFlow GA: lead_submit already tracked on this page load");
            return;
        }

        if (typeof window.gtag === "function") {
            window.gtag("event", "lead_submit", {
                event_category: "lead",
                event_label: "contact_form",
                form_name: "ClientFlow contact form",
                tracking_source: source,
                page_title: document.title,
                page_location: window.location.href
            });

            leadSubmitTracked = true;

            console.log("ClientFlow GA: lead_submit event sent");
        } else {
            console.log("ClientFlow GA: lead_submit not sent because gtag is not loaded");
        }
    }

    // Fallback tracking:
    // If the success message appears on screen, track the lead.
    function watchSuccessMessage() {
        if (!formMessages.length) {
            console.log("ClientFlow contact form: #form-messages not found");
            return;
        }

        var target = formMessages[0];

        var observer = new MutationObserver(function() {
            var messageText = $(formMessages).text().toLowerCase();

            console.log("ClientFlow contact form: message changed:", messageText);

            if (
                messageText.includes("thank you") ||
                messageText.includes("successfully") ||
                messageText.includes("sent successfully")
            ) {
                trackLeadSubmit("success_message_observer");
            }
        });

        observer.observe(target, {
            childList: true,
            characterData: true,
            subtree: true
        });

        console.log("ClientFlow contact form: success message observer active");
    }

    watchSuccessMessage();

    // Set up an event listener for the contact form.
    $(document).on('submit', '#ajax_contact', function(event) {
        // Stop the browser from submitting the form.
        event.preventDefault();

        console.log("ClientFlow contact form: submit detected");

        // Serialize the form data.
        var formData = $(this).serialize();

        // Submit the form using AJAX.
        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: formData
        })
        .done(function(response) {
            console.log("ClientFlow contact form: success response received");
            console.log("ClientFlow contact form: response:", response);
            console.log("ClientFlow contact form: gtag type is:", typeof window.gtag);

            // Make sure that the formMessages div has the 'success' class.
            $(formMessages).removeClass('alert-danger');
            $(formMessages).addClass('alert-success');

            // Set the message text.
            $(formMessages).text(response);

            // Track successful lead submission.
            trackLeadSubmit("ajax_done");

            // Clear the form.
            $('#fullname').val('');
            $('#firstname').val('');
            $('#lastname').val('');
            $('#email').val('');
            $('#phone').val('');
            $('#company').val('');
            $('#business').val('');
            $('#message').val('');

            console.log("ClientFlow contact form: form cleared after success");
        })
        .fail(function(data) {
            console.log("ClientFlow contact form: failed response received");
            console.log("ClientFlow contact form: failed data:", data);

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