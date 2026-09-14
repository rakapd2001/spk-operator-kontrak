"use client";

import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";

export default function ActivityCard({ activities = [] }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Aktivitas Terbaru
        </Typography>

        <Stack divider={<Divider />} spacing={2}>
          {activities.map((item) => (
            <Stack
              key={item.time}
              direction="row"
              justifyContent="space-between"
            >
              <div>
                <Typography fontWeight={600}>{item.title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {item.detail}
                </Typography>
              </div>

              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
