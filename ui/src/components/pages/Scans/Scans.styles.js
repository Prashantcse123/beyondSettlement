import GlobalStyles from '@scopio/scopio-styles/lib/Styles/Global';

export default function styles(theme) {
    return Object.assign({}, GlobalStyles(theme), {
        scans: {
            height: '100%',
        },
        scansFloatingButton: {
            position: "absolute",
            right: "48px",
            bottom: "48px"
        },
        scanThumbnail: {
            cursor: "pointer",
            maxWidth: "180px",
            maxHeight: "180px"
        },
        toolButton: {
            minWidth: 50,
        }
    });
};
