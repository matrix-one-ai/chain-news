"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Fade } from "@mui/material";

const UserPrivacy = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  return (
    <Box>
      <Fade in={checked} timeout={1000}>
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Last Updated: {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            At ChainNews, we’re committed to providing unbiased, 24/7 crypto
            news while respecting your privacy. This Privacy Policy explains how
            ChainNews (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            collects, uses, and protects information when you access our website
            or use our services.
          </Typography>
          <Typography variant="h6" gutterBottom>
            What Information We Collect
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            ChainNews may collect certain information from users to enhance our
            services and your experience. The types of information we may
            collect include:
          </Typography>
          <Typography component="ul" color="#d1d1d1" gutterBottom>
            <li>
              <Typography>
                <strong>Basic Information:</strong> When you interact with
                certain parts of our site (e.g., account registration or content
                interaction), we may collect basic information such as your name
                and email address if you choose to provide them.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Usage Data:</strong> We collect information on how you
                access and use ChainNews, including IP addresses, browser type,
                device information, pages visited, and time spent on our
                website.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Cookies and Tracking Technologies:</strong> ChainNews
                uses cookies and similar tracking technologies to personalize
                content, analyze trends, and monitor website performance. You
                can control cookie settings in your browser, though disabling
                cookies may limit some functionalities.
              </Typography>
            </li>
          </Typography>
          <Typography variant="h6" gutterBottom>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            ChainNews uses collected information for a variety of purposes,
            including:
          </Typography>
          <Typography component="ul" color="#d1d1d1" gutterBottom>
            <li>
              To improve, personalize, and optimize our services and content
            </li>
            <li>To analyze usage patterns and understand user preferences</li>
            <li>
              To communicate relevant updates about ChainNews and our services
            </li>
            <li>To maintain the security and integrity of our platform</li>
          </Typography>
          <Typography variant="h6" gutterBottom>
            Data Sharing
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            ChainNews does not sell, trade, or rent your personal information to
            third parties. We may share limited data in these cases:
          </Typography>
          <Typography component="ul" color="#d1d1d1" gutterBottom>
            <li>
              <strong>Service Providers:</strong> We may share data with trusted
              service providers who assist in operating our website or providing
              services, as long as they agree to maintain confidentiality.
            </li>
            <li>
              <strong>Legal Compliance:</strong> We may disclose information if
              required by law or in response to valid legal processes, including
              to protect the rights and safety of our users or the public.
            </li>
          </Typography>
          <Typography variant="h6" gutterBottom>
            Our Approach to Security
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            We implement security measures to protect against unauthorized
            access, alteration, or disclosure of your data. However, no system
            is completely secure, and we cannot guarantee the absolute security
            of any information.
          </Typography>
          <Typography variant="h6" gutterBottom>
            User Rights
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            ChainNews supports your rights to control and manage your data. You
            may have the following options based on your location:
          </Typography>
          <Typography component="ul" color="#d1d1d1" gutterBottom>
            <li>
              <strong>Access:</strong> Request access to the personal
              information we store.
            </li>
            <li>
              <strong>Correction:</strong> Request corrections of any
              inaccuracies.
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal
              information, subject to legal requirements.
            </li>
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            If you’d like to exercise any of these rights, please reach out to
            us using the contact information below.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Links to Third-Party Sites
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            Our website may contain links to other sites. ChainNews is not
            responsible for the privacy practices or content of these sites, and
            we recommend reviewing their policies before providing personal
            information.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Policy Changes
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            ChainNews may update this Privacy Policy to reflect changes in our
            practices, technology, or legal requirements. Any updates will be
            posted on this page, and we encourage you to review this policy
            periodically to stay informed.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            If you have questions, concerns, or requests regarding this Privacy
            Policy, feel free to contact us:
          </Typography>
          <Typography gutterBottom>Email: hi@chainnews.one</Typography>
        </div>
      </Fade>
    </Box>
  );
};

export default UserPrivacy;
