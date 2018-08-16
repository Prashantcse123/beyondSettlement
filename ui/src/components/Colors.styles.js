import ColorConstants from './ColorsConstants';

export default function styles(theme) {
    return {
        primaryColor: {
            '& *': { color: theme.palette.primary }
        },
        secondaryColor: {
            '& *': { color: theme.palette.secondary }
        },
        whiteColor: {
            color: ColorConstants.white,
            '& *': { color: ColorConstants.white }
        },
        whiteBackground: {
            background: ColorConstants.white,
        },
        blackColor: {
            color: ColorConstants.black,
            '& *': { color: ColorConstants.black }
        },
        blackBackground: {
            background: ColorConstants.black,
        },
        grayColor: {
            color: ColorConstants.gray,
            '& *': { color: ColorConstants.gray }
        },
        grayBackground: {
            background: ColorConstants.gray,
        },
        lightGrayColor: {
            color: ColorConstants.lightGray,
            '& *': { color: ColorConstants.lightGray }
        },
        lightGrayBackground: {
            background: ColorConstants.lightGray,
        },
        redColor: {
            color: ColorConstants.red,
            '& *': { color: ColorConstants.red }
        },
        redBackground: {
            background: ColorConstants.red,
        },
        orangeColor: {
            color: ColorConstants.orange,
            '& *': { color: ColorConstants.orange }
        },
        orangeBackground: {
            background: ColorConstants.orange,
        }
    }
};
