document.addEventListener('DOMContentLoaded', function () {
    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

// writing a mail
function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    document.querySelector("#compose-form").onsubmit = (event) => {
        event.preventDefault();

        // Getting name of recipient, email, body and subject
        const recipient = document.querySelector('#compose-recipients');
        const email_subject = document.querySelector('#compose-subject');
        const email_body = document.querySelector('#compose-body');

        if (!checkDetails(recipient, email_subject, email_body))
            return false;
        else
            load_mailbox("sent");
    }
}

// Checking the input details before sending the mail
function checkDetails(recipients, subject, body) {
    // When the user doesn't input a recipient name 
    // or subject or body then show an alert and 
    // don't go ahead 
    if (recipients.value.length <= 0) {
        alert("Enter Recipient(s) ID!");
        return false;
    }
    else if (subject.value.length <= 0) {
        alert("Enter Mail Subject");
        return false;
    }
    else if (body.value.length <= 0) {
        alert("Enter Mail Body!");
        return false;
    }
    // everything is alright then go ahead and send the mail
    return sendMail(recipients.value, subject.value, body.value);
}

// After checking, sending the mail
function sendMail(recipients, subject, body) {
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: `${recipients}`,
            subject: `${subject}`,
            body: `${body}`
        })
    })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
        })
    return true;
}

// loading specific mailbox like inbox, sent, archive
function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // fetching the mails in that mailbox
    fetch(`/emails/${mailbox}`)
        // converting the received response into json
        .then(response => response.json())
        .then(emails => {
            // getting each email from all the emails
            for (let email in emails) {
                // creating a div
                const mail = document.createElement("div");
                mail.className = "card mailink";
                const rec = `${emails[email].recipients}`;
                const sen = `${emails[email].sender}`;
                if (mailbox == "sent") {
                    mail.innerHTML = `${rec.bold()} ${emails[email].subject} | ${emails[email].timestamp}`;
                }
                else {
                    mail.innerHTML = `${sen.bold()} ${emails[email].subject} | ${emails[email].timestamp}`;
                }
                
                if (!emails[email].read)
                    mail.style.background = "white";                
                else 
                    mail.style.background = "rgb(196, 188, 188)";
                mail.style.border = "1px solid black";
                document.querySelector('#emails-view').append(mail);

                // when a specific mail is clicked open that mail
                mail.onclick = function () {
                    open_mail(emails[email].id, mailbox);

                    // email is not unread then make it read
                    if (!emails[email].read) {
                        read(emails[email].id);
                    }
                }
            }
        })
}

// opening a specific mail
function open_mail(mail_id, mail_box) {
    let page = document.querySelector('#emails-view');
    page.style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    page.innerHTML = '';

    // getting the data of that specific mail
    fetch(`/emails/${mail_id}`)
        .then(response => response.json())
        .then(email => {
            const myUserName = document.querySelector("h2").innerHTML;
            const mail = document.createElement("div");
            mail.className = "card specificMail";

            // Adding different text according to different mailboxes
            if (mail_box == "sent") {
                mail.innerHTML = `<b>From:</b> ${myUserName}<br>
              <b>To:</b> ${email.recipients}<br>
              <b>Timing:</b> ${email.timestamp}<br>
              <b>Subject:</b> ${email.subject}<br>`;
                page.appendChild(mail);
            }
            else {
                mail.innerHTML = `<b>From:</b> ${email.sender}<br>
              <b>To:</b> ${myUserName}<br>
              <b>Timing:</b> ${email.timestamp}<br>
              <b>Subject:</b> ${email.subject}<br>`;
                page.appendChild(mail);

                // adding extra functionalities of archive and reply button
                const archive_button = document.createElement("button");
                archive_button.className = "btn btn-outline-primary";

                // when email is archived make it unarchive on clicking the button
                if (email.archived)
                    archive_button.innerHTML = "Unarchive";
                // otherwise make it archive on clicking the button
                else
                    archive_button.innerHTML = "Archive";
                archive_button.addEventListener("click", () => {
                    archive_mail(email.id, email.archived)
                });
                page.appendChild(archive_button);

                // replying functionality
                const reply_button = document.createElement("button");
                reply_button.className = "btn btn-outline-primary";
                reply_button.innerHTML = "Reply";
                reply_button.id = "reply_button";
                reply_button.addEventListener("click", () => {
                    reply_mail(email.id)
                });
                page.appendChild(reply_button);
            }

            // adding a line for separation
            const line = document.createElement("hr");
            page.appendChild(line);

            // adding the content of the body of the mail into the page
            const body = document.createElement("div");
            body.innerHTML = `${email.body}`;
            page.appendChild(body);
        });
}

// Implementation for archive/unarchive functionality
function archive_mail(mail_id, state) {
    fetch(`/emails/${mail_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !state
        }),
    });
    load_mailbox("inbox");
}


// Implementation for read/unread functionality
function read(mail_id) {
    fetch(`/emails/${mail_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        }),
    });
}

// replying to mail functionality
function reply_mail(mail_id) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    fetch(`/emails/${mail_id}`)
        .then(response => response.json())
        .then(email => {
            document.querySelector('#compose-recipients').value = `${email.sender}`;

            // when re is not there then adding it to the subject
            if (email.subject.indexOf("Re: ") !== 0) {
                document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
            } // otherwise don't change it
            else {
                document.querySelector('#compose-subject').value = `${email.subject}`;
            }// adding an extra lines filled with the previous body content
            document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n`;
        });


    document.querySelector("#compose-form").onsubmit = (event) => {
        event.preventDefault();

        // Getting name of recipient, email, body and subject
        const recipient = document.querySelector('#compose-recipients');
        const email_subject = document.querySelector('#compose-subject');
        const email_body = document.querySelector('#compose-body');

        // then sending the mail after checking its details
        if (!checkDetails(recipient, email_subject, email_body))
            return false;
        else
            load_mailbox("sent");
    }
}