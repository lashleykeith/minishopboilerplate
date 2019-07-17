const fs = require('fs');
const pdf = require('html-pdf');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const Contact = require('../models/Contact');

const ITEMS_PER_PAGE = 10;

exports.index = (req, res, next) => {
  res.render('contact', {
    title: 'Contact'
  });
};

exports.postSaveContact = (req, res, next) => {
  const { name } = req.body;
  const { email } = req.body;
  const { subject } = req.body;
  const { message } = req.body;

  const contact = new Contact({
    name,
    email,
    subject,
    message
  });

  contact.save((err) => {
    if (err) { return next(err); }
    res.redirect('/contact');
  });
};

exports.getDeleteContact = (req, res, next) => {
  const { id } = req.params;
  Contact.findOneAndDelete({ _id: id }, (err) => {
    if (err) {
      console.log(err);
    } else {
      return res.redirect('back');
    }
  });
};

exports.getEditContact = (req, res, next) => {
  const { id } = req.params;
  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
      res.render('editContact', {
        title: 'Edit Contact',
        contact
      });
    }
  });
};

exports.postEditContact = (req, res, next) => {
  const { id } = (req.params);
  const { name } = req.body;
  const { email } = req.body;
  const { subject } = req.body;
  const { message } = req.body;
  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
      contact.name = name;
      contact.email = email;
      contact.subject = subject;
      contact.message = message;
      contact.save((err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/contactDatabase');
      });
    }
  });
};

exports.getReportContact = (req, res, next) => {
  const { id } = (req.params);
  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
      const html = `
                    <style>
                    table{
                        border-collapse: collapse;
                        margin-top: 30px;
                        margin-left: 70px;
                        margin-right: 30px;
                    }
                    .heading{
                        font-weight: bold;
                        width: 150px;
                    }
                    .value{
                        width: 500px;
                    }
                    </style>
                    <div style="margin-top: 50px">
                      <h1 style="margin-left: 70px;">Contact Information</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <table border="1">
                        <tr>
                          <td class="heading">Name</td>
                          <td class="value">${contact.name}</td>
                        </tr>
                        <tr>
                          <td class="heading">Email</td>
                          <td class="value">${contact.email}</td>
                        </tr>
                        <tr>
                          <td class="heading">Subject</td>
                          <td class="value">${contact.subject}</td>
                        </tr>
                        <tr>
                          <td class="heading">Message</td>
                          <td class="value">${contact.message}</td>
                        </tr>
                        <tr>
                          <td class="heading">Date Entered</td>
                          <td class="value">${contact.createdAt}</td>
                        </tr>
                      </table>
                  </div>
          `;
      const pdfFilePath = './contactInformation.pdf';
      const options = { format: 'Letter' };
      pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
        if (err) {
          console.log(err);
          res.status(500).send('Some kind of error...');
          return;
        }
        fs.readFile(pdfFilePath, (err, data) => {
          res.contentType('application/pdf');
          res.send(data);
        });
      });
    }
  });
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail',
    pass: 'yourpassword'
  }
});

exports.getSendEmailContact = (req, res, next) => {
  const { id } = (req.params);
  res.render('sendEmailContact', {
    title: 'Send Email',
    id
  });
};

exports.postSendEmailContact = (req, res, next) => {
  const { id } = (req.params);
  const { recipientEmail } = req.body;
  const { yourEmail } = req.body;
  const { message } = req.body;

  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
      const html = `
                    <style>
                    table{
                        border-collapse: collapse;
                        margin-top: 30px;
                        margin-left: 70px;
                        margin-right: 30px;
                    }
                    .heading{
                        font-weight: bold;
                        width: 150px;
                    }
                    .value{
                        width: 500px;
                    }
                    </style>
                    <div style="margin-top: 50px">
                      <h1 style="margin-left: 70px;">Contact Information</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <table border="1">
                        <tr>
                          <td class="heading">Name</td>
                          <td class="value">${contact.name}</td>
                        </tr>
                        <tr>
                          <td class="heading">Email</td>
                          <td class="value">${contact.email}</td>
                        </tr>
                        <tr>
                          <td class="heading">Subject</td>
                          <td class="value">${contact.subject}</td>
                        </tr>
                        <tr>
                          <td class="heading">Message</td>
                          <td class="value">${contact.message}</td>
                        </tr>
                        <tr>
                          <td class="heading">Date Entered</td>
                          <td class="value">${contact.createdAt}</td>
                        </tr>
                      </table>
                  </div>
          `;
      const pdfFilePath = './contactInformation.pdf';
      const options = { format: 'Letter' };
      pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
        if (err) {
          console.log(err);
          res.status(500).send('Some kind of error...');
          return;
        }
        fs.readFile(pdfFilePath, (err, data) => {
          transporter.sendMail({
            to: recipientEmail,
            from: yourEmail,
            subject: 'Contact Information',
            html: message,
            attachments: [{
              filename: 'contactInformation.pdf',
              content: data,
              type: 'application/pdf',
              disposition: 'attachment',
              contentId: 'myId'
            }],
          });
        });
      });
    }
  });
  res.render('sendEmailContact', {
    title: 'Send Email',
    id
  });
};

exports.getDeletePageContact = (req, res, next) => {
  const { page } = (req.params) || 1;
  let totalItem;
  let status = true;
  Contact.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Contact.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((contacts) => {
      contacts.forEach((contact) => {
        Contact.findOneAndDelete({ _id: contact.id }, (err) => {
          if (err) {
            console.log(err);
          } else {
            status = true;
          }
        });
      });
    });
  if (status) {
    if (page === '1') {
      return res.redirect('/contactDatabase/?page=1');
    }
    return res.redirect(`/contactDatabase/?page=${page - 1}`);
  }
};

exports.getSavePageContact = (req, res, next) => {
  const { page } = (req.params) || 1;
  let totalItem;
  Contact.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Contact.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((contacts) => {
      const html = ejs.render(`<style>
                    table{
                        border-collapse: collapse;
                        margin-top: 30px;
                        margin-left: 70px;
                        margin-right: 30px;
                    }
                    .heading{
                        font-weight: bold;
                        width: 150px;
                    }
                    .value{
                        width: 500px;
                    }
                    </style>
                    <div style="margin-top: 50px">
                      <h1 style="margin-left: 70px;">Contacts Information</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <% contacts.forEach(function (contact) {%>
                      <table border="1">
                        <tr>
                          <td class="heading">Name</td>
                          <td class="value"><%=contact.name%></td>
                        </tr>
                        <tr>
                          <td class="heading">Address</td>
                          <td class="value"><%=contact.email%></td>
                        </tr>
                        <tr>
                          <td class="heading">Subject</td>
                          <td class="value"><%=contact.subject%></td>
                        </tr>
                        <tr>
                          <td class="heading">Message</td>
                          <td class="value"><%=contact.message%></td>
                        </tr>
                        <tr>
                          <td class="heading">Date Entered</td>
                          <td class="value"><%=contact.createdAt%></td>
                        </tr>
                   </table>
                   <% }) %>
                   </div>`, { contacts });
      const pdfFilePath = './contactsInformation.pdf';
      const options = { format: 'Letter' };
      pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
        if (err) {
          console.log(err);
          res.status(500).send('Some kind of error...');
          return;
        }
        fs.readFile(pdfFilePath, (err, data) => {
          res.contentType('application/pdf');
          res.send(data);
        });
      });
    });
};

exports.getSendEmailPageContact = (req, res, next) => {
  const { page } = (req.params);
  res.render('sendEmailPageContact', {
    title: 'Send Email Page',
    page
  });
};

exports.postSendEmailPageContact = (req, res, next) => {
  const { page } = (req.params);
  const { recipientEmail } = req.body;
  const { yourEmail } = req.body;
  const { subject } = req.body;
  const { message } = req.body;
  let totalItem;
  Contact.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Contact.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((contacts) => {
      const html = ejs.render(`<style>
                    table{
                        border-collapse: collapse;
                        margin-top: 30px;
                        margin-left: 70px;
                        margin-right: 30px;
                    }
                    .heading{
                        font-weight: bold;
                        width: 150px;
                    }
                    .value{
                        width: 500px;
                    }
                    </style>
                    <div style="margin-top: 50px">
                      <h1 style="margin-left: 70px;">Contacts Information</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <% contacts.forEach(function (contact) {%>
                      <table border="1">
                        <tr>
                          <td class="heading">Name</td>
                          <td class="value"><%=contact.name%></td>
                        </tr>
                        <tr>
                          <td class="heading">Address</td>
                          <td class="value"><%=contact.email%></td>
                        </tr>
                        <tr>
                          <td class="heading">Subject</td>
                          <td class="value"><%=contact.subject%></td>
                        </tr>
                        <tr>
                          <td class="heading">Message</td>
                          <td class="value"><%=contact.message%></td>
                        </tr>
                        <tr>
                          <td class="heading">Date Entered</td>
                          <td class="value"><%=contact.createdAt%></td>
                        </tr>
                   </table>
                   <% }) %>
                   </div>`, { contacts });
      const pdfFilePath = './contactsInformation.pdf';
      const options = { format: 'Letter' };
      pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
        if (err) {
          console.log(err);
          res.status(500).send('Some kind of error...');
          return;
        }
        fs.readFile(pdfFilePath, (err, data) => {
          transporter.sendMail({
            to: recipientEmail,
            from: yourEmail,
            subject: 'Contact Page Information',
            html: message,
            attachments: [{
              filename: 'contacts.pdf',
              content: data,
              type: 'application/pdf',
              disposition: 'attachment',
              contentId: 'myId'
            }],
          });
        });
      });
    });
  res.render('sendEmailPageContact', {
    title: 'Send Email Page',
    page
  });
};
