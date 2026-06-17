import { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {
  Paper, CardActionArea, CardMedia, Grid, TableContainer, Table,
  TableBody, TableHead, TableRow, TableCell, Button, CircularProgress
} from "@material-ui/core";
import image from "./bg.png";
import { DropzoneArea } from 'material-ui-dropzone';
import { common } from '@material-ui/core/colors';
import Clear from '@material-ui/icons/Clear';

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    '&:hover': { backgroundColor: '#ffffff7a' },
  },
}))(Button);

const axios = require("axios").default;

const useStyles = makeStyles((theme) => ({
  grow:         { flexGrow: 1 },
  clearButton: {
    width: "-webkit-fill-available",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },
  root:         { maxWidth: 345, flexGrow: 1 },
  media:        { height: 400 },
  paper:        { padding: theme.spacing(2), margin: 'auto', maxWidth: 500 },
  gridContainer: { justifyContent: "center", padding: "4em 1em 0 1em" },
  mainContainer: {
    backgroundImage: `url(${image})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    height: "93vh",
    marginTop: "8px",
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    backgroundColor: 'transparent',
    boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
    borderRadius: '15px',
  },
  imageCardEmpty:   { height: 'auto' },
  noImage:          { margin: "auto", width: 400, height: "400 !important" },
  input:            { display: 'none' },
  tableContainer:   { backgroundColor: 'transparent !important', boxShadow: 'none !important' },
  table:            { backgroundColor: 'transparent !important' },
  tableHead:        { backgroundColor: 'transparent !important' },
  tableRow:         { backgroundColor: 'transparent !important' },
  tableCell: {
    fontSize: '22px',
    backgroundColor: 'transparent !important',
    borderColor: 'transparent !important',
    color: '#000000a6 !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableCell1: {
    fontSize: '14px',
    backgroundColor: 'transparent !important',
    borderColor: 'transparent !important',
    color: '#000000a6 !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableBody:  { backgroundColor: 'transparent !important' },
  text:       { color: 'white !important', textAlign: 'center' },
  buttonGrid: { maxWidth: "416px", width: "100%" },
  detail: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  appbar:  { background: '#be6a77', boxShadow: 'none', color: 'white' },
  loader:  { color: '#be6a77 !important' },

  // ── Grad-CAM card ──────────────────────────────────────────────────────────
  gradcamCard: {
    margin: "auto",
    maxWidth: 400,
    backgroundColor: 'transparent',
    boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
    borderRadius: '15px',
    overflow: 'hidden',
  },
  gradcamTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000000a6',
    padding: '8px 0 4px',
    fontSize: '15px',
  },
  gradcamImg: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    display: 'block',
  },
  gradcamLegend: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 16px',
    fontSize: '12px',
    color: '#000000a6',
    background: 'white',
  },
  legendBar: {
    width: '100%',
    height: '10px',
    background: 'linear-gradient(to right, #00f, #0ff, #0f0, #ff0, #f00)',
    borderRadius: '5px',
    margin: '0 16px 8px',
  },

  // ── Explanation card ───────────────────────────────────────────────────────
  explanationCard: {
    margin: "auto",
    maxWidth: 600,
    backgroundColor: 'white',
    boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
    borderRadius: '15px',
  },
  explanationContent: {
    padding: theme.spacing(2),
  },
  explanationTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000000a6',
    padding: '8px 0 4px',
    fontSize: '15px',
  },
  explanationText: {
    color: '#000000a6',
    fontSize: '14px',
    lineHeight: 1.6,
  },
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview]           = useState();
  const [data, setData]                 = useState();
  const [image, setImage]               = useState(false);
  const [isLoading, setIsloading]       = useState(false);
  let confidence = 0;

  const sendFile = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios({
        method: "post",
        url: process.env.REACT_APP_API_URL + "/predict-gradcam",
        data: formData,
      });

      if (res.status === 200) setData(res.data);
    } catch (err) {
      console.error("Prediction request failed:", err);
      setData(null);
    } finally {
      setIsloading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) { setPreview(undefined); return; }
    setPreview(URL.createObjectURL(selectedFile));
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) return;
    setIsloading(true);
    sendFile();
  }, [preview]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  if (data) confidence = (parseFloat(data.confidence) * 100).toFixed(2);

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h5" noWrap>
            Skin Disease Classification
          </Typography>
          <div className={classes.grow} />
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} className={classes.mainContainer} disableGutters={true}>
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
        >
          {/* ── Left: original image / dropzone ── */}
          <Grid item xs={12} sm={6} md={5}>
            <Card className={`${classes.imageCard} ${!image ? classes.imageCardEmpty : ''}`}>
              {image && (
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={preview}
                    component="img"
                    title="Uploaded skin image"
                  />
                </CardActionArea>
              )}
              {!image && (
                <CardContent className={classes.content}>
                  <DropzoneArea
                    acceptedFiles={['image/*']}
                    dropzoneText={"Drag and drop an image for detection"}
                    onChange={onSelectFile}
                  />
                </CardContent>
              )}

              {/* Prediction table */}
              {data && (
                <CardContent className={classes.detail}>
                  <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table className={classes.table} size="small">
                      <TableHead className={classes.tableHead}>
                        <TableRow className={classes.tableRow}>
                          <TableCell className={classes.tableCell1}>Label:</TableCell>
                          <TableCell align="right" className={classes.tableCell1}>Confidence:</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className={classes.tableBody}>
                        <TableRow className={classes.tableRow}>
                          <TableCell component="th" scope="row" className={classes.tableCell}>
                            {data.class}
                          </TableCell>
                          <TableCell align="right" className={classes.tableCell}>
                            {confidence}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}

              {isLoading && (
                <CardContent className={classes.detail}>
                  <CircularProgress color="secondary" className={classes.loader} />
                  <Typography className={classes.title} variant="h6" noWrap>
                    Processing
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>

          {/* ── Right: Grad-CAM heatmap (only shown after prediction) ── */}
          {data && data.gradcam_image && (
            <Grid item xs={12} sm={6} md={5}>
              <Card className={classes.gradcamCard}>
                <Typography className={classes.gradcamTitle}>
                  Grad-CAM Heatmap
                </Typography>
                <img
                  src={`data:image/png;base64,${data.gradcam_image}`}
                  alt="Grad-CAM heatmap"
                  className={classes.gradcamImg}
                />
                {/* Colour scale legend */}
                <div className={classes.legendBar} />
                <div className={classes.gradcamLegend}>
                  <span>Low influence</span>
                  <span>High influence</span>
                </div>
              </Card>
            </Grid>
          )}

          {/* ── AI explanation (only when Gemini returns text) ── */}
          {data && data.class && data.explanation && (
            <Grid item xs={12} sm={10} md={8}>
              <Card className={classes.explanationCard}>
                <CardContent className={classes.explanationContent}>
                  <Typography className={classes.explanationTitle}>
                    AI Explanation
                  </Typography>
                  <Typography className={classes.explanationText} component="p">
                    {data.explanation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* ── Clear button ── */}
          {data && (
            <Grid item className={classes.buttonGrid}>
              <ColorButton
                variant="contained"
                className={classes.clearButton}
                color="primary"
                component="span"
                size="large"
                onClick={clearData}
                startIcon={<Clear fontSize="large" />}
              >
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
