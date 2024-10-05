import React, { useMemo } from "react";

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
}> = ({
  open,
  close,
  high,
  low,
  index,
  spacing,
  maxPrice,
  scaleY = 10, // Set a default exaggeration factor
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

  const positionX = index * spacing;

  return (
    <>
      {/* Wick */}
      <mesh position={[positionX, wickPositionY, 0]}>
        <boxGeometry args={[0.05, wickHeight / maxPrice, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Candle */}
      <mesh position={[positionX, candlePositionY, 0]}>
        <boxGeometry args={[0.3, candleHeight / maxPrice, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
};

const CryptoCandlestickChart: React.FC<CryptoCandlestickChartProps> = ({
  data,
  maxPrice,
  spacing,
  position = [0, 0, 0],
  scaleY = 10,
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
      />
    ));
  }, [data, maxPrice, spacing, scaleY]);

  return <group position={position}>{candles}</group>;
};

export default CryptoCandlestickChart;
