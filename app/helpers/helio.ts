export enum PayTypes {
  SMALL,
  LARGE,
  SMALL_MATRIX,
  LARGE_MATRIX,
}

export const getPayTypePaylink = (payType: PayTypes) => {
  switch (payType) {
    case PayTypes.SMALL:
      return process.env.NEXT_PUBLIC_HELIO_SMALL_PAYLINK_ID!;
    case PayTypes.LARGE:
      return process.env.NEXT_PUBLIC_HELIO_LARGE_PAYLINK_ID!;
    case PayTypes.SMALL_MATRIX:
      return process.env.NEXT_PUBLIC_HELIO_SMALL_MATRIX_PAYLINK_ID!;
    case PayTypes.LARGE_MATRIX:
      return process.env.NEXT_PUBLIC_HELIO_LARGE_MATRIX_PAYLINK_ID!;
  }
};
