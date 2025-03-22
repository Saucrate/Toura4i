import React from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: 1rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.background.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    font-size: 1.25rem;
  }

  input {
    flex: 1;
    border: none;
    background: none;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.875rem;
    outline: none;

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  select {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    background: ${({ theme }) => theme.colors.background.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.875rem;
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const SearchAndFilter = ({ searchValue, onSearchChange, filters = [], onFilterChange }) => {
  return (
    <Container>
      <SearchInput>
        <FiSearch />
        <input
          type="text"
          value={searchValue}
          onChange={onSearchChange}
          placeholder="بحث..."
        />
      </SearchInput>

      {filters.length > 0 && (
        <FiltersRow>
          {filters.map(filter => (
            <FilterGroup key={filter.key}>
              <label>{filter.label}</label>
              <select
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
              >
                <option value="">الكل</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterGroup>
          ))}
        </FiltersRow>
      )}
    </Container>
  );
};

export default SearchAndFilter; 