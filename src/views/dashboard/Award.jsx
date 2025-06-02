'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Award
 = () => {
  const healthScore = 85;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <Typography variant="h6">Health Status</Typography>

        <Box position="relative" display="inline-flex">
          <CircularProgress
            variant="determinate"
            value={healthScore}
            size={100}
            thickness={5}
            color={healthScore >= 75 ? 'success' : healthScore >= 50 ? 'warning' : 'error'}
          />
          <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h6" component="div" color="text.primary">
              {`${healthScore}%`}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Your health is looking great! 💪
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Award;
