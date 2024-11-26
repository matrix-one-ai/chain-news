import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Fade,
  Modal,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import { useAuthStore, useOverlayStore } from "../zustand/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import HelioWidget from "./HelioWidget";
import UserTOS from "./UserPage/UserTOS";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { getPayTypePaylink, PayTypes } from "../helpers/helio";

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
  credits,
  matrixPrice,
  fiatPrice,
  isSelected,
  onClick,
}: {
  credits: number;
  matrixPrice?: number;
  fiatPrice?: number;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <Card
      sx={{
        minWidth: "18.25rem",
        margin: "0.5rem 0",
        backgroundColor: "#34284f",
        border: "2px solid #83838340",
        borderRadius: "0.75rem",
        ...(isSelected && {
          border: "2px solid #10B7FF",
        }),
      }}
      onClick={onClick}
    >
      <CardActionArea
        sx={{
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Stack
            sx={{
              justifyContent: "flex-start",
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Radio checked={isSelected} />
            <Typography variant="subtitle1" fontWeight="bold">
              {credits} Credits
            </Typography>
          </Stack>

          {credits === 2000 && (
            <Chip
              size="small"
              label={"+1400 Extra"}
              color="secondary"
              sx={{
                fontWeight: "bold",
                width: "fit-content",
              }}
            />
          )}

          <Box>
            {fiatPrice && (
              <Box
                sx={{
                  mt: 2,
                }}
              >
                <Typography
                  variant="h6"
                  component="span"
                  sx={{
                    mr: 1,
                  }}
                >
                  ${fiatPrice}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  if paid in Crypto
                </Typography>
              </Box>
            )}

            {matrixPrice && (
              <Stack
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  flexDirection: "row",
                  pt: 1,
                }}
              >
                <Typography variant="h6" component="span">
                  ${matrixPrice}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  if paid in $MATRIX
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
            )}
          </Box>
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

enum CreditSizes {
  SMALL = 100,
  LARGE = 2000,
}

const PaywallModal = () => {
  const { isLoggedIn, isSubscribed, setTriggerWeb3AuthModal } = useAuthStore();
  const { isPaywallModalOpen, setIsPaywallModalOpen } = useOverlayStore();
  const [paywallStep, setPaywallStep] = useState<PaywallSteps>(
    PaywallSteps.INTRO
  );
  const [payType, setPayType] = useState<PayTypes>(PayTypes.SMALL);

  const [selectedCreditSize, setSelectedCreditSize] = useState<CreditSizes>(
    CreditSizes.SMALL
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
                      }}
                    >
                      <PriceCard
                        credits={2000}
                        fiatPrice={99}
                        matrixPrice={80}
                        onClick={() => setSelectedCreditSize(CreditSizes.LARGE)}
                        isSelected={selectedCreditSize === CreditSizes.LARGE}
                      />

                      <PriceCard
                        credits={100}
                        fiatPrice={19}
                        matrixPrice={15}
                        onClick={() => setSelectedCreditSize(CreditSizes.SMALL)}
                        isSelected={selectedCreditSize === CreditSizes.SMALL}
                      />
                    </Stack>

                    <Box
                      sx={{
                        mt: 2,
                        backgroundColor: "#ad7aff",
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
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "white" }}
                          >
                            Pay With Crypto
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "white",
                            }}
                          >
                            On BTC, ETH, MATIC, BASE or SOL
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          sx={{
                            color: "white",
                            borderColor: "white",
                            borderRadius: "0.5rem",
                            height: "2.5rem",
                            width: "10rem",
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            ":hover": {
                              backgroundColor: "white",
                              color: "black",
                            },
                          }}
                          onClick={() => {
                            if (selectedCreditSize === CreditSizes.LARGE) {
                              setPayType(PayTypes.LARGE);
                            }
                            if (selectedCreditSize === CreditSizes.SMALL) {
                              setPayType(PayTypes.SMALL);
                            }

                            if (isLoggedIn) {
                              setPaywallStep(PaywallSteps.HELIO);
                            } else {
                              setPaywallStep(PaywallSteps.LOGIN);
                            }
                          }}
                        >
                          Upgrade to Pro
                        </Button>
                      </Stack>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        color: "text.secondary",
                        textAlign: "center",
                      }}
                    >
                      OR
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        backgroundColor: "#ad7aff",
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
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "white" }}
                          >
                            Pay With $MATRIX
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "white",
                            }}
                          >
                            Get 20% Discount.{" "}
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{
                                color: "white",
                                textDecoration: "underline",
                                ":hover": {
                                  cursor: "pointer",
                                },
                              }}
                            >
                              <Link
                                href="https://jup.ag/swap/USDC-E1R4RF89GcKxz62DVfojxDJteLFFs8rtiXcGcrx5HbTj"
                                target="_blank"
                              >
                                Buy $MATRIX here
                              </Link>
                            </Typography>
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          sx={{
                            color: "white",
                            borderColor: "white",
                            borderRadius: "0.5rem",
                            height: "2.5rem",
                            width: "10rem",
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            ":hover": {
                              backgroundColor: "white",
                              color: "black",
                            },
                          }}
                          onClick={() => {
                            if (selectedCreditSize === CreditSizes.LARGE) {
                              setPayType(PayTypes.LARGE_MATRIX);
                            }
                            if (selectedCreditSize === CreditSizes.SMALL) {
                              setPayType(PayTypes.SMALL_MATRIX);
                            }

                            if (isLoggedIn) {
                              setPaywallStep(PaywallSteps.HELIO);
                            } else {
                              setPaywallStep(PaywallSteps.LOGIN);
                            }
                          }}
                        >
                          Upgrade to Pro
                        </Button>
                      </Stack>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ mt: 2, textAlign: "center" }}
                    >
                      50% of all revenue is used to buy back and burn $MATRIX
                      token.
                    </Typography>

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
                  paylinkId={getPayTypePaylink(payType)}
                  credits={
                    payType === PayTypes.SMALL ||
                    payType === PayTypes.SMALL_MATRIX
                      ? 100
                      : 2000
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
