import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { purchases, products } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
};

const Purchases = () => {
  const [purchaseList, setPurchaseList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1
  });

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await purchases.getAll();
      setPurchaseList(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch purchase requests');
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await products.getAll();
      setProductList(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await purchases.create({
        ...formData,
        created_by: user.id
      });
      setOpen(false);
      fetchPurchases();
      setFormData({ product_id: '', quantity: 1 });
    } catch (err) {
      setError('Failed to create purchase request');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await purchases.updateStatus(id, newStatus);
      fetchPurchases();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Purchase Requests
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ mb: 2 }}
        >
          New Request
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseList.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.product_name}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={purchase.status}
                      color={statusColors[purchase.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{purchase.created_by_user}</TableCell>
                  <TableCell>
                    {user.role === 'admin' && purchase.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleUpdateStatus(purchase.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleUpdateStatus(purchase.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* New Request Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Purchase Request</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              select
              margin="dense"
              label="Product"
              fullWidth
              required
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            >
              {productList.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              label="Quantity"
              type="number"
              fullWidth
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) })}
              inputProps={{ min: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Purchases; 