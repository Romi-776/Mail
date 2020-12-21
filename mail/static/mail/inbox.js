document.addEventListener('DOMContentLoaded', function() {

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
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector("#compose-form").onsubmit = (event) => {
    event.preventDefault();
    // Getting name of recipient, email body and subject
    const recipient = document.querySelector('#compose-recipients');
    const email_subject = document.querySelector('#compose-subject');
    const email_body = document.querySelector('#compose-body');

    // When the user doesn't input a recipient name 
    // or subject or body
    if (!checkDetails(recipient, email_subject, email_body))
      return false;
    else
      load_mailbox("sent");
  }
}

function checkDetails(recipients, subject, body)
{
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
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails)
    })
}