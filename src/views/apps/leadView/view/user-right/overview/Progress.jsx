import React, { useEffect, useState } from "react";
import { Box, Typography, Stepper, Step, StepLabel, Card } from "@mui/material";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from "@mui/lab";
import axios from "axios";
import { toast } from "react-toastify";
const events = [
  { label: "Step 1", description: "Started the project" },
  { label: "Step 2", description: "Designed UI/UX" },
  { label: "Step 3", description: "Developed Backend" },
  { label: "Step 4", description: "Testing & Debugging" },
  { label: "Step 5", description: "Deployment" },
];

const Progress = (props) => {
  console.log("dataBoost", props);
  const [pipelineData, setPipelineData] = useState({})

  const fetchPipelineData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      toast.error("API URL is not configured.");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline/${props.id.campaignid.Pipeline}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setPipelineData(response.data);
        console.log("pipelineData:", response.data);
      } else {
        toast.error("Failed to fetch pipelines. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      toast.error("An error occurred while fetching pipelines.");
    }
  };
  // Manage active step state
  const [activeStep, setActiveStep] = useState(props.id.stages);

  useEffect(() => {
    fetchPipelineData()
  }, [])
  return (
    <Card>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", overflowX: "auto", padding: 2, mt: 5 }}>
        {/* <Stepper alternativeLabel activeStep={activeStep}>
          {events.map((event, index) => (
            <Step key={index}>
              <StepLabel>{event.label}</StepLabel>
            </Step>
          ))}
        </Stepper> */}
        <Timeline position="bottom" sx={{ display: "flex", flexDirection: "row", overflowX: "auto", mt: 2 }}>
          {pipelineData.stages?.map((event, index) => (
            <TimelineItem key={index} sx={{ minWidth: 120 }}>
              <TimelineSeparator>
                <TimelineDot color={activeStep >= index ? "primary" : "grey"} />
                {index < events.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" align="center">{event.name}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Card>
  );
};

export default Progress;
