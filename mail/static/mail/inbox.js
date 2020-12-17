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

  document.querySelector("#compose-form").onsubmit = () => {
    // Getting name of recipient, email body and subject
    let recipient = document.querySelector('#compose-recipients');
    let email_subject = document.querySelector('#compose-subject');
    let email_body = document.querySelector('#compose-body');

    // When the user doesn't input a recipient name 
    // or subject or body
    if (recipient.value.length <= 0) {
      alert("Enter Recipient Email ID!");
    }
    else if (email_subject.value.length <= 0) {
      alert("Enter Subject of the mail!");  
    }
    else if (email_body.value.length <= 0) {
      alert("Enter Body of the mail!");
    }
    // if all the fields are given
    else 
    {
      // sending te
      fetch("/emails", {
        method: 'POST',
        body: JSON.stringify({
          recipients: `${recipient}`,
          subject: `${email_subject}`,
          body: `${email_body}`
        })
      })
        .then(response => response.json())
        .then(result => {
          console.log(result)
          load_mailbox('sent');
      }) 
    }  
    
  }
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