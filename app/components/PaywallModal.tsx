import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Fade,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { useAuthStore, useOverlayStore } from "../zustand/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import HelioWidget from "./HelioWidget";
import UserTOS from "./UserPage/UserTOS";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PaywallFeature = ({ image, text }: { image: string; text: string }) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Image src={image} alt="Feature" width={50} height={50} />
      <Typography
        variant="body1"
        sx={{
          textTransform: "uppercase",
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
};

const paywallFeatures = [
  {
    image: "/images/paywall-feature-1.svg",
    text: "Get the breaking crypto news powered by AI",
  },
  {
    image: "/images/paywall-feature-2.svg",
    text: "Your own personalized newsdesK",
  },
  {
    image: "/images/paywall-feature-3.svg",
    text: "Real-time chat with our AI hosts",
  },
  {
    image: "/images/paywall-feature-4.svg",
    text: "Live token price insights and charts",
  },
];

const PriceCard = ({
  duration,
  matrixPrice,
  fiatPrice,
  isSelected,
  onClick,
}: {
  duration: string;
  matrixPrice: number;
  fiatPrice: number;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <Card
      sx={{
        width: "100%",
        backgroundColor: "#34284f",
        border: "2px solid #83838340",
        borderRadius: "0.75rem",
        ...(isSelected && {
          border: "2px solid #10B7FF",
        }),
      }}
      onClick={onClick}
    >
      <CardActionArea>
        <CardContent>
          <Stack
            sx={{
              justifyContent: "space-between",
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              pb: 2,
            }}
          >
            <Typography gutterBottom variant="subtitle1" fontWeight="bold">
              {duration}
            </Typography>
            {duration === "Annual" && (
              <Chip
                size="small"
                label="Save 43%"
                color="secondary"
                sx={{
                  fontWeight: "bold",
                }}
              />
            )}
          </Stack>
          <Typography variant="h6">
            ${fiatPrice}{" "}
            <Typography
              sx={{
                color: "text.secondary",
              }}
              component={"span"}
            >
              / {duration === "Annual" ? " year" : " month"}
            </Typography>
          </Typography>
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexDirection: "row",
              pt: 1,
            }}
          >
            <Typography variant="h6">
              {matrixPrice}{" "}
              <Typography component="span" variant="h6">
                $MATRIX
              </Typography>{" "}
              <Typography
                sx={{
                  color: "text.secondary",
                }}
                component={"span"}
              >
                / {duration === "Annual" ? " year" : " month"}
              </Typography>
            </Typography>
            <Chip
              label="-20%"
              color="secondary"
              size="small"
              sx={{
                fontWeight: "bold",
              }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

enum PaywallSteps {
  INTRO,
  LOGIN,
  HELIO,
  CONCLUSION,
  TERMS,
}

const PaywallModal = () => {
  const { isLoggedIn, isSubscribed, setTriggerWeb3AuthModal } = useAuthStore();
  const { isPaywallModalOpen, setIsPaywallModalOpen } = useOverlayStore();
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [paywallStep, setPaywallStep] = useState<PaywallSteps>(
    PaywallSteps.INTRO
  );

  useEffect(() => {
    if (isLoggedIn && !isSubscribed && paywallStep === PaywallSteps.LOGIN) {
      setPaywallStep(PaywallSteps.HELIO);
    }
  }, [isLoggedIn, isSubscribed, paywallStep]);

  return (
    <Modal
      open={isPaywallModalOpen}
      onClose={() => setIsPaywallModalOpen(false)}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: 1000,
          maxHeight: 750,
          width: "100%",
          backgroundColor: "#2A223C",
          border: "2px solid #83838340",
          outline: "none",
          boxShadow: 24,
          p: 4,
          color: "white",
          borderRadius: "1rem",
        }}
      >
        <Stack direction="row" spacing={2}>
          <Box
            sx={{
              maxWidth: "45%",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "var(--font-pixelify-sans)",
                width: "12rem",
                letterSpacing: "0.1rem",
                pb: 2,
              }}
            >
              Unlock the PRO experience
            </Typography>
            <Stack gap={2}>
              <Stack gap={2}>
                {paywallFeatures.map((feature, index) => (
                  <PaywallFeature key={index} {...feature} />
                ))}
              </Stack>

              <Box sx={{ flexGrow: 1 }} />

              {(paywallStep === PaywallSteps.TERMS ||
                paywallStep === PaywallSteps.HELIO) && (
                <Chip
                  icon={<ArrowBackIcon />}
                  label="Back"
                  variant="outlined"
                  onClick={() => {
                    setPaywallStep(PaywallSteps.INTRO);
                  }}
                />
              )}
            </Stack>
          </Box>

          {paywallStep === PaywallSteps.INTRO && (
            <>
              {!isSubscribed && (
                <Fade
                  in
                  style={{
                    width: "100%",
                  }}
                >
                  <Box>
                    <Stack
                      sx={{
                        justifyContent: "space-between",
                        flexDirection: "row",
                        gap: 2,
                      }}
                    >
                      <PriceCard
                        duration="Annual"
                        matrixPrice={40}
                        fiatPrice={100}
                        onClick={() => setIsAnnual(true)}
                        isSelected={isAnnual}
                      />
                      <PriceCard
                        duration="Monthly"
                        matrixPrice={10}
                        fiatPrice={20}
                        onClick={() => setIsAnnual(false)}
                        isSelected={!isAnnual}
                      />
                    </Stack>

                    <Box
                      sx={{
                        mt: 2,
                        backgroundColor: "info.main",
                        color: "black",
                        p: 2,
                        borderRadius: "0.5rem",
                      }}
                    >
                      <Stack
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexDirection: "row",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Pay with $MATRIX
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#313131",
                            }}
                          >
                            Pay with $MATRIX and get 20% discount.
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          sx={{
                            color: "black",
                            borderColor: "black",
                            borderRadius: "0.5rem",
                            height: "2.5rem",
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            ":hover": {
                              backgroundColor: "black",
                              color: "white",
                            },
                          }}
                          onClick={
                            isLoggedIn
                              ? () => setPaywallStep(PaywallSteps.HELIO)
                              : () => setPaywallStep(PaywallSteps.LOGIN)
                          }
                        >
                          Upgrade to Pro
                        </Button>
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      color="warning"
                      size="large"
                      sx={{
                        mt: 2,
                        backgroundColor: "white",
                        color: "#631EDC",
                        fontSize: "1.1rem",
                        textTransform: "capitalize",
                        fontWeight: "bold",
                      }}
                      fullWidth
                      onClick={() =>
                        setPaywallStep(
                          isLoggedIn ? PaywallSteps.HELIO : PaywallSteps.LOGIN
                        )
                      }
                    >
                      Continue
                    </Button>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        color: "text.secondary",
                        cursor: "pointer",
                        textDecoration: "underline",
                        textAlign: "center",
                        ":hover": {
                          color: "white",
                        },
                      }}
                      onClick={() => setPaywallStep(PaywallSteps.TERMS)}
                    >
                      View subscription terms
                    </Typography>
                  </Box>
                </Fade>
              )}
              {isSubscribed && (
                <Fade in>
                  <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      You have PRO access! Have fun! :D
                    </Typography>
                  </Stack>
                </Fade>
              )}
            </>
          )}

          {paywallStep === PaywallSteps.LOGIN && (
            <Fade in>
              <Stack
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: "100%",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Log in to continue PRO Upgrade
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  sx={{
                    mt: 2,
                    backgroundColor: "white",
                    color: "#631EDC",
                    fontSize: "1.1rem",
                    textTransform: "capitalize",
                    fontWeight: "bold",
                  }}
                  onClick={() => setTriggerWeb3AuthModal(true)}
                >
                  <Typography>Log In</Typography>
                </Button>
              </Stack>
            </Fade>
          )}

          {paywallStep === PaywallSteps.HELIO && (
            <Fade in>
              <Stack
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: "100%",
                }}
              >
                <HelioWidget
                  paylinkId={
                    isAnnual
                      ? process.env.NEXT_PUBLIC_HELIO_YEARLY_PAYLINK_ID!
                      : process.env.NEXT_PUBLIC_HELIO_MONTHLY_PAYLINK_ID!
                  }
                  onSuccess={() => setPaywallStep(PaywallSteps.CONCLUSION)}
                />
              </Stack>
            </Fade>
          )}

          {paywallStep === PaywallSteps.CONCLUSION && (
            <Fade in>
              <Stack
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: "100%",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Thank you for upgrading to PRO!
                </Typography>
              </Stack>
            </Fade>
          )}

          {paywallStep === PaywallSteps.TERMS && (
            <Box
              sx={{
                width: "100%",
                height: 500,
                overflow: "auto",
              }}
            >
              <Fade in>
                <Stack justifyContent="center" alignItems="center">
                  <UserTOS />
                </Stack>
              </Fade>
            </Box>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default PaywallModal;
