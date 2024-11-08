import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid2,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { useOverlayStore } from "../zustand/store";
import Image from "next/image";
import { useState } from "react";

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

const PaywallModal = () => {
  const { isPaywallModalOpen, setIsPaywallModalOpen } = useOverlayStore();
  const [isAnnual, setIsAnnual] = useState(true);

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
        <Grid2 container>
          <Grid2></Grid2>
        </Grid2>
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
              {paywallFeatures.map((feature, index) => (
                <PaywallFeature key={index} {...feature} />
              ))}
            </Stack>
          </Box>
          <Box
            sx={{
              width: "100%",
            }}
          >
            <Stack
              sx={{
                justifyContent: "space-between",
                flexDirection: "row",
                gap: 2,
              }}
            >
              <PriceCard
                duration="Annual"
                matrixPrice={20}
                fiatPrice={69}
                onClick={() => setIsAnnual(true)}
                isSelected={isAnnual}
              />
              <PriceCard
                duration="Monthly"
                matrixPrice={5}
                fiatPrice={9.99}
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
            >
              View subscription terms
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default PaywallModal;
