import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { apiFetch } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { useColorScheme } from '@/components/useColorScheme';

export default function ShopScreen() {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // API Data States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null); // Slug
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null); // Slug
  const [sortBy, setSortBy] = useState<string>('default'); // 'default', 'price_asc', 'price_desc'

  // Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCat, selectedBrand, sortBy]);

  async function fetchFilters() {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        apiFetch('/api/categories?populate=*'),
        apiFetch('/api/brands?populate=*'),
      ]);
      setCategories(catsRes?.data || []);
      setBrands(brandsRes?.data || []);
    } catch (e) {
      console.error('Error fetching categories/brands:', e);
    }
  }

  async function fetchProducts() {
    setIsLoading(true);
    setError(null);
    try {
      let queryParams = '?populate=*';

      // Text search
      if (search.trim()) {
        queryParams += `&filters[name][$containsi]=${encodeURIComponent(search.trim())}`;
      }

      // Category filter
      if (selectedCat) {
        queryParams += `&filters[category][slug][$eq]=${selectedCat}`;
      }

      // Brand filter
      if (selectedBrand) {
        queryParams += `&filters[brand][slug][$eq]=${selectedBrand}`;
      }

      // Sorting
      if (sortBy === 'price_asc') {
        queryParams += '&sort=price:asc';
      } else if (sortBy === 'price_desc') {
        queryParams += '&sort=price:desc';
      }

      const response = await apiFetch(`/api/products${queryParams}`);
      setProducts(response?.data || []);
    } catch (e: any) {
      setError(e.message || 'Error al conectar con el servidor backend');
    } finally {
      setIsLoading(false);
    }
  }

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCat(null);
    setSelectedBrand(null);
    setSortBy('default');
    setIsModalOpen(false);
  };

  // Check if any filters are active to show a badge or color accent
  const hasActiveFilters = selectedCat !== null || selectedBrand !== null || sortBy !== 'default';

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      
      {/* Search and Filter Row */}
      <View style={styles.headerRow}>
        <View style={[styles.searchContainer, isDark ? styles.searchDark : styles.searchLight]}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={isDark ? '#888' : '#777'}
            size={18}
          />
          <TextInput
            placeholder="Buscar productos..."
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, isDark ? styles.textDark : styles.textLight]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                tintColor={isDark ? '#888' : '#777'}
                size={18}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button next to Search */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsModalOpen(true)}
          style={[
            styles.filterButton,
            isDark ? styles.btnDark : styles.btnLight,
            hasActiveFilters && styles.filterButtonActive,
          ]}
        >
          <SymbolView
            name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
            tintColor={hasActiveFilters ? '#ffffff' : (isDark ? '#ffffff' : '#000000')}
            size={18}
          />
          <Text
            style={[
              styles.filterButtonText,
              hasActiveFilters ? styles.textWhite : (isDark ? styles.textDark : styles.textLight),
            ]}
          >
            Filtros
          </Text>
          {hasActiveFilters && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Slide Drawer Filter Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlayDismiss} onPress={() => setIsModalOpen(false)} />
          
          <View style={[styles.modalContent, isDark ? styles.modalBgDark : styles.modalBgLight]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, isDark ? styles.modalHeaderBorderDark : styles.modalHeaderBorderLight]}>
              <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
                Filtros y Orden
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  tintColor={isDark ? '#ffffff' : '#000000'}
                  size={20}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Category Filter */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, isDark ? styles.textDark : styles.textLight]}>
                  Categorías
                </Text>
                <View style={styles.chipsContainer}>
                  <TouchableOpacity
                    onPress={() => setSelectedCat(null)}
                    style={[
                      styles.filterChip,
                      !selectedCat ? styles.chipActive : (isDark ? styles.chipDark : styles.chipLight),
                    ]}
                  >
                    <Text style={[styles.chipText, !selectedCat && styles.chipTextActive]}>Todas</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => {
                    const isActive = selectedCat === cat.attributes.slug;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCat(cat.attributes.slug)}
                        style={[
                          styles.filterChip,
                          isActive ? styles.chipActive : (isDark ? styles.chipDark : styles.chipLight),
                        ]}
                      >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                          {cat.attributes.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Brand Filter */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, isDark ? styles.textDark : styles.textLight]}>
                  Marcas
                </Text>
                <View style={styles.chipsContainer}>
                  <TouchableOpacity
                    onPress={() => setSelectedBrand(null)}
                    style={[
                      styles.filterChip,
                      !selectedBrand ? styles.chipActive : (isDark ? styles.chipDark : styles.chipLight),
                    ]}
                  >
                    <Text style={[styles.chipText, !selectedBrand && styles.chipTextActive]}>Todas</Text>
                  </TouchableOpacity>
                  {brands.map((b) => {
                    const isActive = selectedBrand === b.attributes.slug;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        onPress={() => setSelectedBrand(b.attributes.slug)}
                        style={[
                          styles.filterChip,
                          isActive ? styles.chipActive : (isDark ? styles.chipDark : styles.chipLight),
                        ]}
                      >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                          {b.attributes.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Sort Options */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, isDark ? styles.textDark : styles.textLight]}>
                  Ordenar por
                </Text>
                <View style={styles.sortContainerVertical}>
                  {[
                    { key: 'default', label: 'Relevancia / Predeterminado' },
                    { key: 'price_asc', label: 'Menor precio primero' },
                    { key: 'price_desc', label: 'Mayor precio primero' },
                  ].map((opt) => {
                    const isActive = sortBy === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => setSortBy(opt.key)}
                        style={[
                          styles.sortOptionRow,
                          isActive ? styles.sortOptionRowActive : (isDark ? styles.sortOptionRowDark : styles.sortOptionRowLight),
                        ]}
                      >
                        <Text style={[styles.sortOptionText, isActive && styles.sortOptionTextActive]}>
                          {opt.label}
                        </Text>
                        {isActive && (
                          <SymbolView
                            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                            tintColor="#4361ee"
                            size={16}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={[styles.modalFooter, isDark ? styles.modalFooterBorderDark : styles.modalFooterBorderLight]}>
              <TouchableOpacity onPress={handleClearFilters} style={styles.modalClearBtn}>
                <Text style={styles.modalClearBtnText}>Restablecer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.modalApplyBtn}>
                <Text style={styles.modalApplyBtnText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Products Grid */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={[styles.loadingText, isDark ? styles.textDark : styles.textLight]}>
            Cargando productos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <SymbolView
            name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
            tintColor="#e63946"
            size={36}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchProducts} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <SymbolView
            name={{ ios: 'tray', android: 'inbox', web: 'inbox' }}
            tintColor={isDark ? '#888' : '#777'}
            size={40}
          />
          <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
            No se encontraron productos
          </Text>
          <TouchableOpacity onPress={handleClearFilters} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Limpiar filtros</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  bgLight: {
    backgroundColor: '#f8f9fa',
  },
  bgDark: {
    backgroundColor: '#121212',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  searchDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333333',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 13,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 6,
    position: 'relative',
  },
  btnLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  btnDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333333',
  },
  filterButtonActive: {
    backgroundColor: '#4361ee',
    borderColor: '#4361ee',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e63946',
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#ffffff',
  },
  textWhite: {
    color: '#ffffff',
  },
  textGreyLight: {
    color: '#666666',
  },
  textGreyDark: {
    color: '#aaaaaa',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalBgLight: {
    backgroundColor: '#ffffff',
  },
  modalBgDark: {
    backgroundColor: '#1c1c1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalHeaderBorderLight: {
    borderBottomColor: '#f1f3f5',
  },
  modalHeaderBorderDark: {
    borderBottomColor: '#2c2c2e',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    marginTop: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipLight: {
    backgroundColor: '#f1f3f5',
    borderColor: '#e5e5e5',
  },
  chipDark: {
    backgroundColor: '#2e2e2e',
    borderColor: '#3a3a3c',
  },
  chipActive: {
    backgroundColor: '#4361ee',
    borderColor: '#4361ee',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e9aaf',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  sortContainerVertical: {
    gap: 8,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortOptionRowLight: {
    borderColor: '#e5e5e5',
    backgroundColor: '#f8f9fa',
  },
  sortOptionRowDark: {
    borderColor: '#2c2c2e',
    backgroundColor: '#2e2e2e',
  },
  sortOptionRowActive: {
    borderColor: '#4361ee',
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#8e9aaf',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#4361ee',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  modalFooterBorderLight: {
    borderTopColor: '#f1f3f5',
  },
  modalFooterBorderDark: {
    borderTopColor: '#2c2c2e',
  },
  modalClearBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e63946',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClearBtnText: {
    color: '#e63946',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalApplyBtn: {
    flex: 2,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#e63946',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: '#e63946',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 16,
    color: '#777777',
  },
  clearBtn: {
    borderColor: '#4361ee',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  clearBtnText: {
    color: '#4361ee',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
