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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { products } from '../services/api';

const Products = () => {
  const [productList, setProductList] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    current_stock: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await products.getAll();
      setProductList(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await products.create(formData);
      setOpen(false);
      fetchProducts();
      setFormData({ name: '', description: '', current_stock: 0 });
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await products.updateStock(id, { current_stock: newStock });
      fetchProducts();
    } catch (err) {
      setError('Failed to update stock');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Products
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
          Add Product
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.current_stock}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        const newStock = prompt('Enter new stock value:', product.current_stock);
                        if (newStock !== null) {
                          handleUpdateStock(product.id, parseInt(newStock, 10));
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Product Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Initial Stock"
              type="number"
              fullWidth
              required
              value={formData.current_stock}
              onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value, 10) })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Products; 