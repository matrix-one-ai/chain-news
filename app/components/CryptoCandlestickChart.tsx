import React, { useMemo } from "react";
import { Text } from "@react-three/drei";

interface CryptoCandlestickChartProps {
  spacing: number;
  position?: [number, number, number];
  scaleY?: number; // Add scaleY for vertical exaggeration
  scaleX?: number; // Add scaleX for horizontal exaggeration
  token?: string; // Add token prop for ticker symbol
}

const data = [
  { date: "2024-09-25", open: 100, high: 110, low: 90, close: 105 },
  { date: "2024-09-26", open: 105, high: 115, low: 95, close: 100 },
  { date: "2024-09-27", open: 100, high: 120, low: 80, close: 110 },
  { date: "2024-09-28", open: 110, high: 130, low: 100, close: 125 },
  { date: "2024-09-29", open: 125, high: 140, low: 120, close: 135 },
  { date: "2024-09-30", open: 135, high: 145, low: 130, close: 132 },
  { date: "2024-10-01", open: 132, high: 137, low: 125, close: 127 },
  { date: "2024-10-02", open: 127, high: 130, low: 115, close: 118 },
  { date: "2024-10-03", open: 118, high: 125, low: 110, close: 120 },
  { date: "2024-10-04", open: 120, high: 135, low: 115, close: 125 },
  { date: "2024-10-05", open: 125, high: 140, low: 110, close: 115 },
  { date: "2024-10-06", open: 115, high: 120, low: 100, close: 105 },
  { date: "2024-10-07", open: 105, high: 110, low: 90, close: 95 },
  { date: "2024-10-08", open: 95, high: 105, low: 85, close: 100 },
  { date: "2024-10-09", open: 100, high: 115, low: 90, close: 110 },
  { date: "2024-10-10", open: 110, high: 125, low: 105, close: 120 },
];

const maxPrice = Math.max(...data.map((d) => d.high));

const Candle: React.FC<{
  open: number;
  close: number;
  high: number;
  low: number;
  index: number;
  spacing: number;
  maxPrice: number;
  scaleY: number;
  scaleX: number;
}> = ({
  open,
  close,
  high,
  low,
  index,
  spacing,
  maxPrice,
  scaleY = 10, // Set a default exaggeration factor for vertical
  scaleX = 1, // Set a default exaggeration factor for horizontal
}) => {
  const isUp = close >= open;
  const color = isUp ? "green" : "red";

  // Exaggerate candle height but keep the base in place
  const candleHeight = Math.abs(close - open) * scaleY;
  const candleMidPoint =
    (Math.min(open, close) + Math.abs(close - open) / 2) / maxPrice;
  const candlePositionY = candleMidPoint * scaleY; // Base stays fixed, height is exaggerated

  const wickHeight = (high - low) * scaleY; // Exaggerate wick height
  const wickMidPoint = (high + low) / 2 / maxPrice;
  const wickPositionY = wickMidPoint * scaleY;

  // Adjust X position and size based on scaleX
  const positionX = index * spacing * scaleX;

  return (
    <>
      {/* Wick */}
      <mesh position={[positionX, wickPositionY, 0]}>
        <boxGeometry args={[0.05 * scaleX, wickHeight / maxPrice, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Candle */}
      <mesh position={[positionX, candlePositionY, 0]}>
        <boxGeometry args={[0.3 * scaleX, candleHeight / maxPrice, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
};

// Price Label Component
const PriceLabel: React.FC<{
  price: number;
  positionX: number;
  positionY: number;
}> = ({ price, positionX, positionY }) => (
  <Text
    position={[positionX, positionY, 0]}
    fontSize={0.2}
    color="white"
    anchorX="left"
    anchorY="middle"
  >
    {`$${price}`}
  </Text>
);

const CryptoCandlestickChart: React.FC<CryptoCandlestickChartProps> = ({
  spacing,
  position = [0, 0, 0],
  scaleY = 10,
  scaleX = 1, // Default horizontal scaling is 1
  token = "TOKEN", // Default token name
}) => {
  // Memoize candles to avoid unnecessary re-renders
  const candles = useMemo(() => {
    return data.map((datum, index) => (
      <Candle
        key={index}
        open={datum.open}
        close={datum.close}
        high={datum.high}
        low={datum.low}
        index={index}
        spacing={spacing}
        maxPrice={maxPrice}
        scaleY={scaleY} // Pass scaleY to each candle
        scaleX={scaleX} // Pass scaleX to each candle
      />
    ));
  }, [spacing, scaleY, scaleX]);

  // Define some price levels for the labels
  const priceLevels = useMemo(() => {
    const interval = maxPrice / 5;
    return Array.from({ length: 5 }, (_, i) => (i + 1) * interval);
  }, []);

  return (
    <group position={position}>
      {/* Render Candles */}
      {candles}

      {/* Add Price Labels on the Y-axis */}
      {priceLevels.map((price, i) => (
        <PriceLabel
          key={i}
          price={Number(price.toFixed(2))} // Format price to 2 decimals
          positionX={-1.5} // Adjust the X position for labels
          positionY={(price / maxPrice) * scaleY} // Reduce Y-axis padding by shifting labels down slightly
        />
      ))}

      {/* Add $TOKEN ticker in the lower left-hand corner */}
      <Text
        position={[-4, 5, 0]} // Lower left corner of the chart
        fontSize={0.5}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        {`$${token}`}
      </Text>
    </group>
  );
};

export default CryptoCandlestickChart;
