"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Download, PictureAsPdf, AutoGraph } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // FIX: Imported directly
import axios from "axios";

export default function Task2SqlAssistant() {
  const [table, setTable] = useState("");
  const [uploading, setUploading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [sql, setSql] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // State Variables for Premium Features
  const [history, setHistory] = useState([]);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sql/history");
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async (e) => {
    if (!e.target.files[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/sql/upload",
        formData,
      );
      setTable(res.data.tableName);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const generateInsight = async (queryPrompt, queryResults) => {
    setInsightLoading(true);
    setInsight("");
    try {
      const res = await axios.post("http://localhost:5000/api/sql/insights", {
        prompt: queryPrompt,
        results: queryResults,
      });
      setInsight(res.data.insight);
    } catch (err) {
      console.error(err);
    }
    setInsightLoading(false);
  };

  const handleQuery = async (overridePrompt = null) => {
    const currentPrompt = overridePrompt || prompt;
    if (!currentPrompt || !table) return;

    setSearching(true);
    try {
      const res = await axios.post("http://localhost:5000/api/sql/query", {
        tableName: table,
        prompt: currentPrompt,
      });
      setSql(res.data.sql);
      setResults(res.data.results);
      fetchHistory(); // Refresh history
      generateInsight(currentPrompt, res.data.results); // Fetch AI Insight
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "SQL_Results.xlsx");
  };

  // FIX: Updated exportPDF function using the direct autoTable call
  const exportPDF = () => {
    const doc = new jsPDF();
    const head = [Object.keys(results[0]).filter((k) => k !== "_id")];

    // Ensure all data is cast to string to prevent autoTable rendering errors
    const body = results.map((row) => head[0].map((key) => String(row[key])));

    // Pass doc as the first parameter
    autoTable(doc, { head, body, startY: 20 });

    doc.text("AI SQL Query Results", 14, 15);
    doc.save("SQL_Results.pdf");
  };

  // Determine chart axes dynamically based on data types
  const chartKeys =
    results.length > 0
      ? Object.keys(results[0]).filter((k) => k !== "_id")
      : [];
  const xAxisKey = chartKeys.find((k) => isNaN(results[0][k])) || chartKeys[0];
  const yAxisKey = chartKeys.find((k) => !isNaN(results[0][k])) || chartKeys[1];

  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold">
          Mistral AI SQL Assistant
        </Typography>
      </Grid>

      {/* Main Panel */}
      <Grid item xs={12} md={8}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Button
                component="label"
                variant="contained"
                disabled={uploading}
              >
                {uploading ? "Parsing Dataset..." : "Upload CSV File"}
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleUpload}
                />
              </Button>
              {table && (
                <Typography color="success.main" sx={{ mt: 2 }}>
                  Dataset Loaded: {table}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Natural Language Query
              </Typography>
              <TextField
                fullWidth
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Show top 5 customers by revenue"
                sx={{ mb: 2 }}
                disabled={!table}
              />
              <Button
                variant="contained"
                color="success"
                onClick={() => handleQuery(null)}
                disabled={searching || !table}
              >
                {searching ? (
                  <CircularProgress size={24} />
                ) : (
                  "Generate & Execute SQL"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results, Chart, and Insights Area */}
          {results.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* AI Insight Card */}
              <Card sx={{ bgcolor: "#f0f7ff" }}>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <AutoGraph color="primary" /> AI Generated Insight
                  </Typography>
                  {insightLoading ? (
                    <CircularProgress size={20} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {insight}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Data Visualization */}
              {yAxisKey && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Data Visualization
                    </Typography>
                    <Box sx={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={results}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={xAxisKey} />
                          <YAxis />
                          <ChartTooltip />
                          <Bar dataKey={yAxisKey} fill="#1976d2" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Data Table & Export */}
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="body2">
                    Generated SQL: <code>{sql}</code>
                  </Typography>
                  <Box>
                    <Tooltip title="Export to Excel">
                      <IconButton color="primary" onClick={exportExcel}>
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export to PDF">
                      <IconButton color="error" onClick={exportPDF}>
                        <PictureAsPdf />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Card sx={{ overflowX: "auto", maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {chartKeys.map((k) => (
                          <TableCell key={k} sx={{ bgcolor: "#eee" }}>
                            <b>{k}</b>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((row, i) => (
                        <TableRow key={i}>
                          {chartKeys.map((k, j) => (
                            <TableCell key={j}>{row[k]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>

      {/* Sidebar: Query History */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Queries
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {history.length === 0 ? (
              <Typography color="textSecondary" variant="body2">
                No queries yet.
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {history.map((h, idx) => (
                  <Box key={idx}>
                    <ListItem
                      button
                      onClick={() => {
                        setPrompt(h.prompt);
                        if (table) handleQuery(h.prompt);
                      }}
                      sx={{ px: 1 }}
                    >
                      <ListItemText
                        primary={h.prompt}
                        secondary={new Date(h.timestamp).toLocaleTimeString()}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "500",
                        }}
                      />
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
