document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#specific-email-view').style.display = 'none';
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

function checkDetails(recipients, subject, body)
{
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
  else if (body.value.length <= 0){
    alert("Enter Mail Body!");
    return false;
  }
  
  // everything is alright then go ahead and send the mail
  return sendMail(recipients.value, subject.value, body.value);
}

function sendMail(recipients, subject, body)
{
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
    console.log(recipients);
    console.log(result);
  })
  return true;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#specific-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // fetching the mails in that mailbox
  fetch(`/emails/${mailbox}`)
    // converting the received response into json
    .then(response => response.json())
    .then(emails => {
      // getting each email from all the emails
      for (let email in emails)
      { 
        // creating a div
        const mail = document.createElement("div");
        // creating an anchor tag
        const link = document.createElement("a");
        // giving that link a reference
        link.href = `#${emails[email].id}`;
        // setting the id of that tag
        link.id = emails[email].id;

        // getting all the info. about that mail 
        const mailSub = emails[email].subject;
        const sender = emails[email].sender;
        const recipients = emails[email].recipients;
        const timing = emails[email].timestamp;

        // when the mailbox name is sent then print the recipients of that email
        if (mailbox === "sent"){
          console.log(emails[email].recipients);
          const linkText = document.createTextNode(`${recipients} ${mailSub} ${timing}`);
          link.appendChild(linkText);
          mail.appendChild(link);

          document.getElementById('emails-view').append(mail);
        }
        // otherwise print the sender of that email
        else{
          console.log(emails[email].sender);
          const linkText = document.createTextNode(`${sender} ${mailSub} ${timing}`);
          link.appendChild(linkText);
          mail.appendChild(link);

          document.getElementById('emails-view').append(mail);
        }
      }
    })
}

// This will take care of the Load Mail Feature
window.addEventListener("hashchange", function () {
  // location.hash.match(/\d+/g) will get the mailId from the hash number
  // This is specifically used because it will get any number of digit from it
  const mailId = parseInt(location.hash.match(/\d+/g));
  console.log(mailId);
  fetch(`/emails/${mailId}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      load_mail(email);
    });
});

function load_mail(mailContent)
{
  // Show the specific mail and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#specific-email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Getting details from the emailContent
  const from = mailContent["sender"];
  const to = mailContent["recipients"];
  const timing = mailContent["timestamp"];
  const sub = mailContent["subject"];
  const body = mailContent["body"];

  // Adding this detail onto the screen
  document.querySelector('#specific-email-view').innerHTML = `From: ${from} <br>To: ${to}<br>Subject: ${sub}<br>TimeStamp: ${timing}<br>${body}`;
}