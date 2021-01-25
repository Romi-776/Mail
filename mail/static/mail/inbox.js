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
              mail.className = "card";
              mail.style.backgroundColor = "blue";
              mail.style.color = "white";
              mail.style.margin = "5px";
              mail.style.padding = "4px";
              mail.style.cursor = "pointer";

              if (mailbox == "sent") {
                  mail.innerHTML = `${emails[email].recipients} ${emails[email].subject} ${emails[email].timestamp}`;
              }
              else {
                  mail.innerHTML = `${emails[email].sender} ${emails[email].subject} ${emails[email].timestamp}`;
              }

              document.querySelector('#emails-view').append(mail);
              mail.onclick = function () {
                  open_mail(emails[email].id, mailbox);
                  if (!emails[email].read)
                      read(emails[email].id);
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

  fetch(`/emails/${mail_id}`)
      .then(response => response.json())
      .then(email => {
          const myUserName = document.querySelector("h2").innerHTML;
          const mail = document.createElement("div");
          mail.className = "card";
          mail.style.backgroundColor = "blue";
          mail.style.backgroundColor = "white";

          if (mail_box == "sent") {
              mail.innerHTML = `From: ${myUserName}<br>
              To: ${email.recipients}<br>
              Timing: ${email.timestamp}<br>
              Subject: ${email.subject}<br>`;
              page.appendChild(mail);
          }
          else {
              mail.innerHTML = `From: ${email.sender}<br>
              To: ${myUserName}<br>
              Timing: ${email.timestamp}<br>
              Subject: ${email.subject}<br>`;
              page.appendChild(mail);

              const archive_button = document.createElement("btn");
              archive_button.className = "btn btn-outline-primary";

              if (email.archived)
                  archive_button.innerHTML = "Unarchive";
              else
                  archive_button.innerHTML = "Archive";
              archive_button.addEventListener("click", () => {
                  archive_mail(email.id, email.archived)
              });
              page.appendChild(archive_button);
              
              const reply_button = document.createElement("btn");
              reply_button.className = "btn btn-outline-primary";
              reply_button.innerHTML = "Reply";
              reply_button.style.margin = "4px";
              reply_button.addEventListener("click", () => {
                  reply_mail(email.id)
              });
              page.appendChild(reply_button);
          }

          const line = document.createElement("hr");
          page.appendChild(line);

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

function reply_mail(mail_id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  fetch(`/emails/${mail_id}`)
      .then(response => response.json())
      .then(email => {
          document.querySelector('#compose-recipients').value = `${email.sender}`;
          if (email.subject.indexOf("Re: ") !== 0) {
              document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
          }
          else {
              document.querySelector('#compose-subject').value = `${email.subject}`;
          }
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n`;
      });


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