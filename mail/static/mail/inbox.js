document.addEventListener('DOMContentLoaded', function () {


  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  const form = document.querySelector('form')


  load_mailbox('inbox');
});

function compose_email() {


  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


  const form = document.querySelector('#compose-form');
  form.addEventListener('submit', (event) => {

    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    console.log(recipients, subject, body)
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
      .then(response => response.json())
      .then(result => {

        console.log(result);
      });

    load_mailbox('sent')
  });


}

function load_mailbox(mailbox) {

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (document.querySelector('#emails-view').innerText == "Inbox") {
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {

        console.log(emails);

        document.querySelector('#emails-view').append(emails[1].body)

      });
  } else if (document.querySelector('#emails-view').innerText == "Sent") {
    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {

        console.log(emails);


      });
  }
}