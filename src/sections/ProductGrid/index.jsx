/**
 *
 * MIT License
 *
 * Copyright 2021 Shogun, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import * as React from 'react'
import { useRouter } from 'frontend-router'
import { useGoogleTagManagerActions } from '@frontend-sdk/google-tag-manager'
import Container from 'Components/Container'
import Flex from 'Components/Flex'
import Grid from 'Components/Grid'
import Heading from 'Components/Heading'
import List from 'Components/List'
import Pagination from 'Components/Pagination'
import ProductGridItem from 'Components/ProductGridItem'
import VisuallyHidden from 'Components/VisuallyHidden'
import Select from 'Components/Select'
import FormLabel from 'Components/FormLabel'

/**
 * @typedef { import("lib/types").Collection } Collection
 * @typedef { import('Components/Select').SelectOption }  SelectOption
 * @typedef { import('Components/Hooks').ShopifyProduct } ShopifyProduct
 * @typedef { import('Components/Hooks').BigCommerceProduct } BigCommerceProduct
 * @typedef {{
 *  collection?: Collection
 *  productsPerPage?: number
 *  showTitle?: boolean
 * }} ProductGridProps
 *
 * @param { ProductGridProps } props
 */
const ProductGrid = ({ collection, productsPerPage, showTitle }) => {
  const router = useRouter()
  const {
    push,
    pathname,
    query: { page: urlCurrentPage },
  } = router
  const { trackProductListImpressionsEvent } = useGoogleTagManagerActions()
  let { products: apiProducts, name } = collection || {}
  const currentPage =
    urlCurrentPage && !Array.isArray(urlCurrentPage) ? parseInt(urlCurrentPage) : 1

  const handleSort = (
    /** @type {String} */ type,
    /** @type {any[] | ShopifyProduct[] | BigCommerceProduct[] | undefined} */ selection,
  ) => {
    let unsorted = selection

    if (unsorted && type === 'low-high') {
      unsorted.sort(function (a, b) {
        return a.variants[0].price - b.variants[0].price
      })
    } else if (unsorted && type === 'high-low') {
      unsorted.sort(function (a, b) {
        return b.variants[0].price - a.variants[0].price
      })
    } else if (unsorted && type === 'relevance') {
    }

    return unsorted
  }

  const [currentSort, setSort] = React.useState({ sort: 'relevance' })

  const [products, totalPages] = React.useMemo(() => {
    if (!apiProducts) return []
    if (!productsPerPage) return [apiProducts]
    handleSort(currentSort.sort, apiProducts)
    const currentPaginationStart = (currentPage - 1) * productsPerPage
    const currentPaginationEnd = currentPage * productsPerPage
    const totalPages = Math.ceil(apiProducts.length / productsPerPage)

    return [apiProducts.slice(currentPaginationStart, currentPaginationEnd), totalPages]
  }, [apiProducts, currentPage, productsPerPage, currentSort])

  React.useEffect(() => {
    if (!products || products.length === 0) return

    trackProductListImpressionsEvent(products)
  }, [products, trackProductListImpressionsEvent])

  if (!products) return null

  const handlePageChange = (/** @type {number} */ page) => {
    push({ pathname, query: { page: page.toString() } }, undefined, { shallow: true })
  }

  /** @type { SelectOption[] } */ const sortOptions = [
    { text: 'Relevance', value: 'relevance' },
    { text: '$$$ Low - High', value: 'low-high' },
    { text: '$$$ High - Low', value: 'high-low' },
  ]

  return (
    <Container mx="auto" as="section" variant="section-wrapper" mt={8}>
      {showTitle ? (
        <Heading as="h2" mb="8">
          {name}
        </Heading>
      ) : (
        <VisuallyHidden as="h2">{name}</VisuallyHidden>
      )}
      <FormLabel textTransform="capitalize">Sort By</FormLabel>
      <Select
        options={sortOptions}
        defaultValue={sortOptions[0].value}
        onChange={e => {
          setSort({ sort: e.target.value })
        }}
      />
      <Grid
        as={List}
        templateColumns={{
          base: 'repeat(auto-fill, minmax(14rem, 1fr))',
          md: 'repeat(auto-fill, minmax(18rem, 1fr))',
        }}
        columnGap="10"
        rowGap="24"
      >
        {products.map((product, index) => (
          <ProductGridItem
            key={index}
            product={product}
            imageLoading={index < 4 ? 'eager' : 'lazy'}
          />
        ))}
      </Grid>
      <Flex justifyContent="center" mt="20">
        {totalPages && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </Flex>
    </Container>
  )
}

export default ProductGrid
