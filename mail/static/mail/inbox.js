document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


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
        load_mailbox('sent')
      });
  });

  load_mailbox('inbox');
});


//opening compose view
function compose_email() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-open').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

//Call inbox, sent, or archived URL depending on the innerHTML at the top of the page which was provided in distribution code
function load_mailbox(mailbox) {
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-open').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (document.querySelector('#emails-view').innerText == "Inbox") {
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        console.log(emails)
        for (let i = 0; i < emails.length; i++) {
          const element = document.createElement('div');
          element.classList.add('emailCol');
          if (emails[i].read == true) {
            element.classList.add("read")
          }
          if (emails[i].archived == false) {
            element.innerHTML = `<div><strong>${emails[i].sender}</strong> <inline>${emails[i].subject}</inline></div>${emails[i].timestamp}`;
            element.addEventListener('click', function () {
              openEmail(emails[i].id)
            });
            document.querySelector('#emails-view').append(element);
          }
        }
      });
  } else if (document.querySelector('#emails-view').innerText == "Sent") {
    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        console.log(emails)
        for (let i = 0; i < emails.length; i++) {
          const element = document.createElement('div');
          element.classList.add('emailCol');
          if (emails[i].read == true) {
            element.classList.add("read")
          }
          element.innerHTML = `<div><strong>${emails[i].sender}</strong> <inline>${emails[i].subject}</inline></div>${emails[i].timestamp}`;
          element.addEventListener('click', function () {
            openEmail(emails[i].id)
          });
          document.querySelector('#emails-view').append(element);
        }
      });
  } else if (document.querySelector('#emails-view').innerText == "Archive") {
    fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {
        console.log(emails)
        for (let i = 0; i < emails.length; i++) {
          const element = document.createElement('div');
          element.classList.add('emailCol');
          if (emails[i].read == true) {
            element.classList.add("read")
          }
          element.innerHTML = `<div><strong>${emails[i].sender}</strong> <inline>${emails[i].subject}</inline></div>${emails[i].timestamp}`;
          element.addEventListener('click', function () {
            openEmail(emails[i].id)
          });
          document.querySelector('#emails-view').append(element);
        }
      });
  }
}

//clear any html and then fetch & display info
function openEmail(id) {
  document.querySelector('#emails-open').innerHTML = '';

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#emails-open').style.display = 'block';
      const element = document.createElement('div');

      if (document.querySelector('h3').innerText == "Inbox") {
        element.innerHTML = `<strong>From:</strong> <span>${email.sender}</span> <br> <strong>To: </strong> <span>${email.recipients}</span> <br> <strong>Subject: </strong> <span>${email.subject}</span> <br> <strong>Timestamp: </strong> <span>${email.timestamp}</span> <br> <button id="replyBtn" class="btn btn-primary">Reply</button> <button id="archive" class="btn btn-primary">Archive</button> <hr> <br> ${email.body}`;
        const archiveButton = element.querySelector('#archive');
        archiveButton.addEventListener('click', () => archive(id));
        const replyButton = element.querySelector('#replyBtn');
        replyButton.addEventListener('click', () => reply(id));

        //no archive button
      } else if (document.querySelector('h3').innerText == "Sent") {
        element.innerHTML = `<strong>From:</strong> <inline>${email.sender}</inline> <br> <strong>To: </strong> <inline>${email.recipients}</inline> <br> <strong>Subject: </strong> <inline>${email.subject}</inline> <br> <strong>Timestamp: </strong> <inline>${email.timestamp}</inline> <br> <button id="replyBtn" class="btn btn-primary">Reply</button> <hr> <br> ${email.body}`
        const replyButton = element.querySelector('#replyBtn');
        replyButton.addEventListener('click', () => reply(id));

      } else if (document.querySelector('h3').innerText == "Archive") {
        element.innerHTML = `<strong>From:</strong> <span>${email.sender}</span> <br> <strong>To: </strong> <span>${email.recipients}</span> <br> <strong>Subject: </strong> <span>${email.subject}</span> <br> <strong>Timestamp: </strong> <span>${email.timestamp}</span> <br> <button id="replyBtn" class="btn btn-primary">Reply</button> <button id="unarchive" class="btn btn-primary">Unarchive</button> <hr> <br> ${email.body}`;
        const unarchiveButton = element.querySelector('#unarchive');
        unarchiveButton.addEventListener('click', () => unarchive(id))
        const replyButton = element.querySelector('#replyBtn');
        replyButton.addEventListener('click', () => reply(id));
      }

      document.querySelector('#emails-open').append(element);
    });
}

//reply - similar to send except we fill in sender, subject (check for 'Re: '), and body
function reply(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-open').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = email.subject;

      if (document.querySelector('#compose-subject').value.startsWith('Re: ')) {
        document.querySelector('#compose-subject').value = email.subject;
      } else if (!document.querySelector('#compose-subject').value.startsWith('Re: ')) {
        document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
      }
      document.querySelector('#compose-body').value = `\n \nOn ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    })
}

function archive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  }).then(console.log(id))


  fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      console.log(emails)
      load_mailbox('inbox')
    });
}

function unarchive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  }).then(console.log(id))


  fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      console.log(emails)
      load_mailbox('inbox')
    });
}

