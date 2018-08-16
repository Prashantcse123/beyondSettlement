import GlobalStyles from './Global.styles';
import RootStyles from './Root.styles';

export default function styles(theme) {
    return Object.assign({}, GlobalStyles(theme), RootStyles(theme), {
        app: {
            height: "100%",
            overflow: "hidden",
        },
        appLayout: {
            height: "calc(100% - 64px)",
            backgroundColor: "rgb(237, 236, 236)",
            display: "flex",
            flex: "1 1 0",
            overflow: "hidden",
            position: "relative"
        },
        fullScreen: {
            height: "100%"
        },
        leftDrawerMenu: {
            flex: "0 0 300px",
            marginLeft: "-300px",
            order: "-1",
            transition: "margin 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
            zIndex: '1',
            borderRadius: 0
        },
        leftDrawerMenuOpen: {
            flex: "0 0 300px",
            marginLeft: "0"
        },
        leftDrawerMenuItemSelected: {
            background: "lightgray"
        },
        appContent: {
            overflow: "auto",
            overflowX: "hidden",
            flex: "1 1 0",
        },
        mainInfoBar: {
            transform: "translate(-50%, -48px)",
            bottom: "auto",
            top: "-100px"
        },
        mainInfoBarOpen: {
            transform: "translate(-50%, 0)",
            top: "0"
        }
    });
};
