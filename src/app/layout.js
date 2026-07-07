"use client";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  CssBaseline,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function RootLayout({ children }) {
  const router = useRouter();
  return (
    <html lang="en">
      <head>
        <title>AI Assessment Platform</title>
      </head>
      <body style={{ backgroundColor: "#f4f6f8", margin: 0 }}>
        <CssBaseline />
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              AI Hub
            </Typography>
            <Button color="inherit" onClick={() => router.push("/task1")}>
              Course Allocation
            </Button>
            <Button color="inherit" onClick={() => router.push("/task2")}>
              SQL Assistant
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
          {children}
        </Container>
      </body>
    </html>
  );
}
