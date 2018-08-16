export default {
    overrides: {
        MuiSwitch: {
            root: {
                height: 30
            },
            switchBase: {
                height: 30
            }
        },
        MuiCheckbox: {
            root: {
                height: 30
            }
        },
        MuiRadio: {
            root: {
                height: 30
            }
        },
        MuiDialogContent: {
            root: {
                borderTop: [[1, 'solid', '#e0e0e0']],
                borderBottom: [[1, 'solid', '#e0e0e0']],
            },
        },
    },
    typography: {
        fontFamily: 'Robotto,Arial,sans-serif'
    },
    palette: {
        primary: {
            light: '#4dabf5',
            main: '#2196f3',
            dark: '#1769aa',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff7961',
            main: '#f44336',
            dark: '#ba000d',
            contrastText: '#000',
        },
        // text: {
        //     primary: 'rgba(0, 0, 0, 0.87)',
        //     secondary: 'rgba(0, 0, 0, 0.54)',
        //     disabled: 'rgba(0, 0, 0, 0.38)',
        //     hint: 'rgba(0, 0, 0, 0.38)',
        // }
    }
};
