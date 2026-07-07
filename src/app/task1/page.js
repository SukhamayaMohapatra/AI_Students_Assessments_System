"use client";
import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import axios from "axios";

export default function Task1Dashboard() {
  const [data, setData] = useState({ courses: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/allocation/dashboard",
      );
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const runLogic = async () => {
    await axios.post("http://localhost:5000/api/allocation/process");
    fetchDashboard();
  };

  const askAi = async () => {
    if (!aiQuestion) return;
    setAiLoading(true);
    const res = await axios.post(
      "http://localhost:5000/api/allocation/ai-query",
      { question: aiQuestion },
    );
    setAiResponse(res.data.answer);
    setAiLoading(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" justifyContent="space-between">
        <Typography variant="h4" fontWeight="bold">
          Course Allocation Engine
        </Typography>
        <Button variant="contained" color="secondary" onClick={runLogic}>
          Process Allocation
        </Button>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Total Applicants</Typography>
            <Typography variant="h4">{data.stats.total}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Allocated</Typography>
            <Typography variant="h4" color="success.main">
              {data.stats.allocated}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Unallocated</Typography>
            <Typography variant="h4" color="error.main">
              {data.stats.unallocated}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ minHeight: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ask Mistral AI
            </Typography>
            <TextField
              fullWidth
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="e.g., Which course had the highest rejection rate?"
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={askAi} disabled={aiLoading}>
              {aiLoading ? <CircularProgress size={24} /> : "Ask Data Query"}
            </Button>
            {aiResponse && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography>{aiResponse}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
