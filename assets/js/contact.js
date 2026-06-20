/*
*
* Contact JS
* ClientFlow contact form + Web3Forms + Google Analytics lead tracking
*
*/

$(function () {
    var form = $('#clientflow-contact-form');
    var formMessages = $('#form-messages');

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

    if (!form.length) {
        console.log("ClientFlow contact form: #clientflow-contact-form not found on this page");
        return;
    }

    console.log("ClientFlow contact form: script active");

    $(document).on('submit', '#clientflow-contact-form', function (event) {
        event.preventDefault();

        console.log("ClientFlow contact form: submit detected");

        var currentForm = this;
        var formData = new FormData(currentForm);
        var actionUrl = $(currentForm).attr('action');

        if (!actionUrl) {
            console.log("ClientFlow contact form: no action URL found");

            if (formMessages.length) {
                formMessages
                    .removeClass('alert-success')
                    .addClass('alert-danger')
                    .text('Sorry, the form is not configured correctly.');
            }

            return;
        }

        if (formMessages.length) {
            formMessages
                .removeClass('alert-danger alert-success')
                .text('Sending your message...');
        }

        fetch(actionUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("ClientFlow contact form: Web3Forms response:", data);

            if (data.success) {
                if (formMessages.length) {
                    formMessages
                        .removeClass('alert-danger')
                        .addClass('alert-success')
                        .text('Thank you. Your message has been sent successfully.');
                }

                trackLeadSubmit("web3forms_success");

                currentForm.reset();

                console.log("ClientFlow contact form: form sent and cleared");
            } else {
                console.log("ClientFlow contact form: Web3Forms returned an error");

                if (formMessages.length) {
                    formMessages
                        .removeClass('alert-success')
                        .addClass('alert-danger')
                        .text(data.message || 'Oops! Your message could not be sent.');
                }
            }
        })
        .catch(function (error) {
            console.log("ClientFlow contact form: fetch error:", error);

            if (formMessages.length) {
                formMessages
                    .removeClass('alert-success')
                    .addClass('alert-danger')
                    .text('Oops! An error occurred and your message could not be sent.');
            }
        });
    });
});