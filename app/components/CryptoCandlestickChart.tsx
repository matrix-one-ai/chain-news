import React, { useMemo } from "react";
import { Text } from "@react-three/drei";

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CryptoCandlestickChartProps {
  data: CandlestickData[];
  maxPrice: number;
  spacing: number;
  position?: [number, number, number];
  scaleY?: number; // Add scaleY for vertical exaggeration
  scaleX?: number; // Add scaleX for horizontal exaggeration
  token?: string; // Add token prop for ticker symbol
}

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
  data,
  maxPrice,
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
  }, [data, maxPrice, spacing, scaleY, scaleX]);

  // Define some price levels for the labels
  const priceLevels = useMemo(() => {
    const interval = maxPrice / 5;
    return Array.from({ length: 5 }, (_, i) => (i + 1) * interval);
  }, [maxPrice]);

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
