"use client";

import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <div>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>

            <Typography
              mt={1}
              fontWeight={700}
              sx={{
                color,
                fontSize: {
                  xs: 28,
                  md: 34,
                },
              }}
            >
              {value}
            </Typography>

            <Typography variant="caption">{subtitle}</Typography>
          </div>

          <Avatar
            sx={{
              bgcolor: bgColor,
              color,
              width: 50,
              height: 50,
            }}
          >
            <Icon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
