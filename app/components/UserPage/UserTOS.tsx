"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Fade } from "@mui/material";

const UserTOS = () => {
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

          <Typography variant="h6" gutterBottom>
            1. Subscription Plans and Payment
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>One-Time Payment:</strong> Subscription to ChainNews pro
            features is a one-time payment that unlocks full access to premium
            content and interactive features, including AI-driven chats and
            exclusive news insights.
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>No Auto-Renewal:</strong> ChainNews subscriptions do not
            auto-renew. If you wish to continue access to pro features after
            your subscription term expires, a new payment will be required.
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Refund Policy:</strong> Refunds are offered only if the
            ChainNews software or pro services do not function as advertised. If
            you encounter a technical issue preventing access to paid features,
            please contact us at hi@chainnews.one with details, and we will
            review your request. Refund requests are not granted for other
            reasons, including dissatisfaction with content.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Permitted Use of ChainNews Services
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Pro Features:</strong> A ChainNews pro subscription provides
            access to premium content, including real-time AI interactions with
            ChainNews’ AI hosts and exclusive insights.
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Personal Use Only:</strong> ChainNews subscriptions are
            intended for individual, personal use only. Commercial use of
            ChainNews pro features is not permitted without prior written
            consent.
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Age Requirement:</strong> By subscribing, you confirm that
            you are at least 18 years of age or the age of legal consent in your
            jurisdiction.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. User Conduct and Content Guidelines
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            To maintain a respectful and secure platform, ChainNews enforces the
            following rules for user interactions:
          </Typography>
          <Typography component="ul" color="#d1d1d1" gutterBottom>
            <li>
              <Typography variant="body1" color="#d1d1d1">
                <strong>Prohibited Content:</strong> We use a filtering system
                similar to ChatGPT’s standards to prevent the use of abusive,
                offensive, or otherwise inappropriate content. Users are
                prohibited from posting or sharing content that:
              </Typography>
              <Typography component="ul">
                <li>
                  Contains vulgar or explicit language, hate speech, threats, or
                  harassment
                </li>
                <li>
                  Violates intellectual property rights or any other applicable
                  laws
                </li>
                <li>Attempts to deceive or spread misinformation</li>
              </Typography>
            </li>
            <li>
              <Typography variant="body1" color="#d1d1d1">
                <strong>Respectful Interactions:</strong> Users are expected to
                engage respectfully with ChainNews’ AI hosts and other users.
                Abusive or disruptive behavior will not be tolerated.
              </Typography>
            </li>
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Account Suspension and Termination
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            ChainNews reserves the right to suspend or terminate your
            subscription and access to pro features if you engage in prohibited
            conduct or misuse our services. Reasons for suspension or
            termination include, but are not limited to:
          </Typography>
          <Typography component="ul" color="#d1d1d1" gutterBottom>
            <li>Abuse of ChainNews software or AI services</li>
            <li>Sharing prohibited or offensive content</li>
            <li>
              Unauthorized use of subscription features, such as sharing account
              access
            </li>
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            In cases of suspension or termination due to conduct violations,
            refunds will not be provided.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Intellectual Property
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Ownership of Content:</strong> ChainNews retains all rights
            to the content, software, and AI features provided as part of the
            pro subscription. Users are granted a limited, non-exclusive,
            non-transferable license to access ChainNews content for personal,
            non-commercial use only.
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>User-Generated Content:</strong> Any content generated
            during your interactions with ChainNews AI remains the intellectual
            property of ChainNews. We reserve the right to use such content for
            service improvement and other lawful purposes, while respecting user
            privacy.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Privacy and Data Usage
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Data Collection:</strong> We collect limited data to
            optimize the user experience and to maintain the security of our
            services. For more information, please see our Privacy Policy.
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>User Responsibility for Wallet Security:</strong> When
            connecting cryptocurrency wallets or other secure access methods,
            users are solely responsible for maintaining the security and
            confidentiality of their credentials. ChainNews is not liable for
            lost funds or data due to compromised wallets or accounts.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Disclaimer and Limitation of Liability
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Accuracy of Information:</strong> ChainNews content,
            including AI-generated insights, is for informational purposes only.
            It does not constitute financial, legal, or investment advice, and
            should not be relied upon as such.
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            <strong>Limitation of Liability:</strong> ChainNews is not liable
            for any direct, indirect, or incidental damages resulting from your
            use of the pro features or interactions with AI characters.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Changes to Subscription Terms
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            ChainNews reserves the right to update or modify these Subscription
            Terms at any time. Any changes will be posted on this page, and by
            continuing to use our pro services, you agree to abide by the
            revised Terms.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. Contact Information
          </Typography>
          <Typography variant="body1" color="#d1d1d1" gutterBottom>
            For questions or concerns regarding these Terms, or to request a
            refund for technical issues, please contact us at:
          </Typography>
          <Typography gutterBottom>Email: hi@chainnews.one</Typography>
        </div>
      </Fade>
    </Box>
  );
};

export default UserTOS;
