import { createMuiTheme } from '@material-ui/core/styles';

const SkyePassTheme = createMuiTheme({
	palette: {
		primary: {
			main: "#6E6E6D",
			main_border: "rgba(139, 139, 138, 0.5)"
		},
		secondary: {
			main: "#FAD0C9",
		},
		text: {
			primary: "#6E6E6D",
		}
	},
	typography: {
    fontFamily: [
			"'Miriam Libre'",
			"Fira Mono", 
			"DejaVu Sans Mono", 
			'Menlo', 
			'Consolas', 
			"Liberation Mono", 
			'Monaco', 
			"Lucida Console", 
			'monospace',
    ].join(','),
		h4: {
			fontWeight: 'bold'
		}
  },
})

export default SkyePassTheme;
