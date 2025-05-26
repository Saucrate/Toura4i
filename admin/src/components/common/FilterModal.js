import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Form, FormGroup, Input } from './Form';
import { Button, ButtonGroup } from './Button';
import Modal from './Modal';

const FilterModal = ({ isOpen, onClose, filterOptions, onApply }) => {
  const [options, setOptions] = React.useState(filterOptions);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(options);
  };

  const handleReset = () => {
    setOptions({
      dateFrom: '',
      dateTo: '',
      performer: '',
      catalog: '',
      category: '',
      location: ''
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Input
            type="date"
            name="dateFrom"
            value={options.dateFrom}
            onChange={handleChange}
            placeholder="من تاريخ"
          />
          <Input
            type="date"
            name="dateTo"
            value={options.dateTo}
            onChange={handleChange}
            placeholder="إلى تاريخ"
          />
          <Input
            type="text"
            name="performer"
            value={options.performer}
            onChange={handleChange}
            placeholder="المنشد"
          />
          <Input
            type="text"
            name="catalog"
            value={options.catalog}
            onChange={handleChange}
            placeholder="الكatalog"
          />
          <Input
            type="text"
            name="category"
            value={options.category}
            onChange={handleChange}
            placeholder="التصنيف"
          />
          <Input
            type="text"
            name="location"
            value={options.location}
            onChange={handleChange}
            placeholder="المكان"
          />
        </FormGroup>

        <ButtonGroup align="end">
          <Button type="button" variant="secondary" onClick={handleReset}>
            إعادة تعيين
          </Button>
          <Button type="submit">
            تطبيق
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

export default FilterModal; 