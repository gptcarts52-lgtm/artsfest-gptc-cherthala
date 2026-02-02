'use client'

import { Box, Container, Typography, Button, Grid, Card, CardContent, Chip, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Palette, 
  MusicNote, 
  TheaterComedy, 
  Camera, 
  MenuBook,
  Event,
  LocationOn,
  AccessTime,
  ArrowForward,
  Menu as MenuIcon
} from '@mui/icons-material'
import { useEffect, useState } from 'react'

const MotionBox = motion(Box)
const MotionTypography = motion(Typography)
const MotionCard = motion(Card)

const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 100%)',
            borderRadius: '50%',
            filter: 'blur(1px)',
          }}
          animate={{
            y: [-15, 15, -15],
            x: [-8, 8, -8],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
    </Box>
  )
}

export default function Home() {
  const [heroRef, heroInView] = useInView({ threshold: 0.3 })
  const [categoriesRef, categoriesInView] = useInView({ threshold: 0.2 })
  const [infoRef, infoInView] = useInView({ threshold: 0.2 })
  const [mobileOpen, setMobileOpen] = useState(false)

  const artCategories = [
    { icon: <Palette />, title: 'Visual Arts', desc: 'Paintings, sculptures, and digital art exhibitions' },
    { icon: <MusicNote />, title: 'Music & Dance', desc: 'Classical, contemporary, and fusion performances' },
    { icon: <TheaterComedy />, title: 'Theatre', desc: 'Drama, comedy, and experimental performances' },
    { icon: <MenuBook />, title: 'Literature', desc: 'Poetry, storytelling, and creative writing' },
    { icon: <Camera />, title: 'Photography', desc: 'Photo exhibitions and digital media showcase' }
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: '#2E3B55', fontWeight: 700 }}>
        ArtsFest 2024
      </Typography>
      <List>
        {['Events', 'Gallery', 'About', 'Contact'].map((item) => (
          <ListItem key={item} sx={{ textAlign: 'center' }}>
            <ListItemText primary={item} />
          </ListItem>
        ))}
        <ListItem sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="contained" fullWidth>
            Register
          </Button>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 20px rgba(46, 59, 85, 0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#2E3B55', fontWeight: 700 }}>
            ArtsFest 2024
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button sx={{ color: '#2E3B55', mr: 2 }}>Events</Button>
            <Button sx={{ color: '#2E3B55', mr: 2 }}>Gallery</Button>
            <Button sx={{ color: '#2E3B55', mr: 2 }}>About</Button>
            <Button variant="contained" size="small">Register</Button>
          </Box>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' }, color: '#2E3B55' }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2E3B55 0%, #4A5568 50%, #E53E3E 100%)',
          color: 'white',
          position: 'relative',
          pt: { xs: 10, md: 8 },
          pb: { xs: 4, md: 0 },
          overflow: 'hidden'
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionTypography
                variant="h1"
                sx={{ mb: 2, fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                initial={{ opacity: 0, y: 50 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                ArtsFest 2024
              </MotionTypography>
              <MotionTypography
                variant="h4"
                sx={{ mb: 3, fontWeight: 400, opacity: 0.9, fontSize: { xs: '1.5rem', md: '2.125rem' } }}
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                GPTC Cherthala
              </MotionTypography>
              <MotionTypography
                variant="h6"
                sx={{ mb: 4, maxWidth: '500px', lineHeight: 1.6, opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Join us for an extraordinary celebration of creativity, talent, and artistic expression at our annual arts festival.
              </MotionTypography>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      backgroundColor: '#E53E3E',
                      color: 'white',
                      px: 4,
                      py: 2,
                      boxShadow: '0 8px 32px rgba(229, 62, 62, 0.4)',
                      '&:hover': {
                        backgroundColor: '#C53030',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(229, 62, 62, 0.6)'
                      }
                    }}
                  >
                    Explore Events
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 2,
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                sx={{
                  width: '100%',
                  height: { xs: '300px', md: '400px' },
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <Box sx={{ textAlign: 'center', p: { xs: 2, md: 4 }, position: 'relative', zIndex: 2 }}>
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2, opacity: 0.8, fontSize: { xs: '3rem', md: '4rem' } }}>
                      🎨
                    </Typography>
                  </motion.div>
                  <Typography variant="h6" sx={{ opacity: 0.7, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    Featured Event Image
                  </Typography>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box
        ref={categoriesRef}
        sx={{ 
          py: { xs: 6, md: 10 }, 
          background: 'linear-gradient(180deg, #F7FAFC 0%, #EDF2F7 100%)',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <MotionTypography
            variant="h2"
            sx={{ textAlign: 'center', mb: 2, color: '#2E3B55' }}
            initial={{ opacity: 0, y: 30 }}
            animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Event Categories
          </MotionTypography>
          <MotionTypography
            variant="body1"
            sx={{
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              color: '#718096',
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.125rem' }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover various artistic disciplines and showcase your talents across multiple categories
          </MotionTypography>
          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            {artCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <MotionCard
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: { xs: 'translateY(-4px)', md: 'translateY(-12px) scale(1.02)' },
                      boxShadow: '0 20px 60px rgba(46, 59, 85, 0.15)',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #EBF8FF 100%)'
                    }
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <CardContent sx={{ 
                    p: { xs: 3, md: 4 }, 
                    textAlign: 'center', 
                    minHeight: { xs: '220px', md: '280px' }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ color: '#2E3B55', mb: { xs: 2, md: 3 }, fontSize: { xs: '2.5rem', md: '3rem' } }}>
                        {category.icon}
                      </Box>
                    </motion.div>
                    <Typography variant="h5" sx={{ 
                      color: '#2D3748', 
                      mb: 2, 
                      fontWeight: 600,
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}>
                      {category.title}
                    </Typography>
                    <Typography sx={{ 
                      color: '#718096',
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}>
                      {category.desc}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Event Info Section */}
      <Box
        ref={infoRef}
        sx={{ 
          py: { xs: 6, md: 10 }, 
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={infoInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h3" sx={{ 
                  color: '#2D3748', 
                  mb: 3, 
                  fontWeight: 600,
                  fontSize: { xs: '1.75rem', md: '2rem' }
                }}>
                  Join the Festival
                </Typography>
                <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Chip
                      icon={<Event />}
                      label="March 15-21, 2024"
                      sx={{ 
                        mb: 1, 
                        backgroundColor: '#EBF8FF', 
                        color: '#2E3B55', 
                        boxShadow: '0 2px 8px rgba(46, 59, 85, 0.1)',
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Chip
                      icon={<LocationOn />}
                      label="GPTC Cherthala Campus"
                      sx={{ 
                        mb: 1, 
                        backgroundColor: '#EBF8FF', 
                        color: '#2E3B55', 
                        boxShadow: '0 2px 8px rgba(46, 59, 85, 0.1)',
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Chip
                      icon={<AccessTime />}
                      label="9:00 AM - 6:00 PM"
                      sx={{ 
                        mb: 1, 
                        backgroundColor: '#EBF8FF', 
                        color: '#2E3B55', 
                        boxShadow: '0 2px 8px rgba(46, 59, 85, 0.1)',
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    />
                  </motion.div>
                </Box>
                <Typography sx={{ 
                  color: '#718096', 
                  mb: 4, 
                  fontSize: { xs: '1rem', md: '1.125rem' }, 
                  lineHeight: 1.7 
                }}>
                  Experience a week-long celebration of creativity and talent. Participate in competitions, attend workshops, and witness spectacular performances by students and guest artists.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(45deg, #2E3B55, #4A5568)',
                      px: 4,
                      py: 2,
                      boxShadow: '0 8px 32px rgba(46, 59, 85, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1A202C, #2E3B55)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(46, 59, 85, 0.4)'
                      }
                    }}
                  >
                    View Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: '#2E3B55',
                      color: '#2E3B55',
                      px: 4,
                      py: 2,
                      '&:hover': {
                        borderColor: '#2E3B55',
                        backgroundColor: 'rgba(46, 59, 85, 0.05)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Register Now
                  </Button>
                </Box>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                sx={{
                  width: '100%',
                  height: { xs: '300px', md: '400px' },
                  background: 'linear-gradient(135deg, rgba(46, 59, 85, 0.1) 0%, rgba(74, 85, 104, 0.05) 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(46, 59, 85, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(46, 59, 85, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                initial={{ opacity: 0, x: 50 }}
                animate={infoInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{ textAlign: 'center', p: { xs: 2, md: 4 } }}>
                  <motion.div
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [-2, 2, -2]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Typography variant="h2" sx={{ 
                      color: '#2E3B55', 
                      mb: 2,
                      fontSize: { xs: '3rem', md: '4rem' }
                    }}>
                      🏛️
                    </Typography>
                  </motion.div>
                  <Typography variant="h6" sx={{ 
                    color: '#718096',
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}>
                    Campus Gallery
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#A0AEC0', 
                    mt: 1,
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}>
                    [Image Placeholder]
                  </Typography>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: { xs: 4, md: 6 }, background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ArtsFest 2024
              </Typography>
              <Typography sx={{ color: '#CBD5E0', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                Government Polytechnic College Cherthala
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography sx={{ color: '#CBD5E0', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                Contact: info@gptccherthala.edu.in
              </Typography>
              <Typography sx={{ color: '#CBD5E0', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                Phone: +91 478 282 1234
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}