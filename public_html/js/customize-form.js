/**
 * Morocco Trek Tours — "Customize your trip" form handler.
 *
 * Replaces the previous inline handler that only logged to the console and
 * showed a fake success alert. Submissions now go to send-email.php, and a
 * success message is only shown when the server confirms the message was
 * accepted by the mail transport.
 *
 * Used by customize-trip.html and customize-trip-fr.html.
 */
(function () {
    'use strict';

    var form = document.getElementById('customizeForm');
    if (!form) {
        return;
    }

    var lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
    var isFr = lang.indexOf('fr') === 0;

    var strings = {
        sending: isFr ? 'Envoi en cours…' : 'Sending…',
        success: isFr
            ? 'Merci ! Votre demande a bien été envoyée. Nous vous répondrons sous 24 heures.'
            : 'Thank you! Your request has been sent. We will get back to you within 24 hours.',
        genericError: isFr
            ? 'Nous n\'avons pas pu envoyer votre demande. Veuillez réessayer ou nous écrire à info@moroccotrektours.com.'
            : 'We could not send your request. Please try again or email info@moroccotrektours.com.',
        networkError: isFr
            ? 'Connexion impossible. Vérifiez votre connexion internet et réessayez, ou écrivez à info@moroccotrektours.com.'
            : 'We could not reach the server. Check your connection and try again, or email info@moroccotrektours.com.',
        tokenError: isFr
            ? 'Votre session a expiré. Rechargez la page puis réessayez.'
            : 'Your session expired. Please reload the page and try again.'
    };

    var button = form.querySelector('button[type="submit"]');
    var buttonText = button ? button.querySelector('.btn-text') : null;
    var originalLabel = buttonText ? buttonText.textContent : (button ? button.textContent : '');
    var status = document.getElementById('formStatus');

    /**
     * Create (or update) a hidden field. The value attribute is set as well so
     * that form.reset() does not wipe required metadata such as form_type.
     */
    function setHidden(name, value) {
        var input = form.querySelector('input[name="' + name + '"]');
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            form.appendChild(input);
        }
        input.value = value;
        input.setAttribute('value', value);
        return input;
    }

    var tokenRequest = null;

    function loadToken() {
        tokenRequest = fetch('generate-csrf-token.php', {
            cache: 'no-store',
            credentials: 'same-origin'
        })
            .then(function (response) {
                if (!response.ok) {
                    return null;
                }
                return response.json();
            })
            .then(function (data) {
                if (data && data.token) {
                    setHidden('csrf_token', data.token);
                    return data.token;
                }
                return null;
            })
            .catch(function () {
                return null;
            });

        return tokenRequest;
    }

    function showStatus(type, message) {
        if (!status) {
            // The template always provides #formStatus; alert only as a fallback.
            window.alert(message);
            return;
        }
        status.className = 'form-status form-status-' + type;
        status.textContent = message;
        status.hidden = false;
        if (typeof status.scrollIntoView === 'function') {
            status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function clearStatus() {
        if (!status) {
            return;
        }
        status.hidden = true;
        status.textContent = '';
        status.className = 'form-status';
    }

    function resetSelectionState() {
        ['region-card', 'interest-item', 'accommodation-card'].forEach(function (className) {
            form.querySelectorAll('.' + className).forEach(function (card) {
                card.classList.remove('selected');
            });
        });

        var counter = document.getElementById('charCount');
        if (counter) {
            counter.textContent = '0';
        }
    }

    function setBusy(isBusy) {
        if (button) {
            button.disabled = isBusy;
            button.setAttribute('aria-busy', isBusy ? 'true' : 'false');
        }
        if (buttonText) {
            buttonText.textContent = isBusy ? strings.sending : originalLabel;
        } else if (button && !buttonText) {
            button.textContent = isBusy ? strings.sending : originalLabel;
        }
    }

    // Ensure the form always carries its type, language and a CSRF token.
    setHidden('form_type', 'customize');
    setHidden('language', isFr ? 'fr' : 'en');
    loadToken();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearStatus();

        if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
            if (typeof form.reportValidity === 'function') {
                form.reportValidity();
            }
            return;
        }

        setBusy(true);

        var start = tokenRequest || loadToken();

        start
            .then(function (token) {
                if (!token) {
                    throw new Error('missing_token');
                }

                return fetch('send-email.php', {
                    method: 'POST',
                    body: new FormData(form),
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' }
                });
            })
            .then(function (response) {
                return response.text().then(function (raw) {
                    var payload = null;
                    try {
                        payload = JSON.parse(raw);
                    } catch (parseError) {
                        payload = null;
                    }
                    return { payload: payload, status: response.status };
                });
            })
            .then(function (result) {
                var payload = result.payload;

                if (payload && payload.success === true) {
                    showStatus('success', payload.message || strings.success);
                    form.reset();
                    resetSelectionState();
                    return;
                }

                var message = payload && payload.message ? payload.message : strings.genericError;
                showStatus('error', message);
            })
            .catch(function (error) {
                showStatus('error', error && error.message === 'missing_token' ? strings.tokenError : strings.networkError);
            })
            .then(function () {
                setBusy(false);
                loadToken();
            });
    });
})();
