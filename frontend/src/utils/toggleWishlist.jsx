import { toast } from "react-toastify"
import { getWishlist, updateWishlist } from "../services/wishlistService"

export const toggleWishlistHandler = async ({
  userId,
  product,
  navigate,
  isWishlisted,
  setIsWishlisted
}) => {

  if (!userId) {
    toast.warning("Please login first ⚠️")
    navigate("/login")
    return
  }

  const productId = String(product.id)

  // ✅ store previous state safely
  const previousState = isWishlisted

  // ✅ optimistic update
  setIsWishlisted(!isWishlisted)

  try {
    const { data: user } = await getWishlist(userId)
    const wishlist = user.wishlist || []

    const exists = wishlist.some(
      item => String(item.productId) === productId
    )

    let updatedWishlist

    if (exists) {
      updatedWishlist = wishlist.filter(
        item => String(item.productId) !== productId
      )
      toast.info("Removed from wishlist 💔")
    } else {
      updatedWishlist = [
        ...wishlist,
        {
          id: crypto.randomUUID?.() || Date.now(),
          productId: product.id,
          name: product.name,
          img: product.img,
          price: product.sizes?.[0]?.price ?? null
        }
      ]
      toast.success("Added to wishlist ❤️")
    }

    await updateWishlist(userId, updatedWishlist)

  } catch (err) {
    console.error(err)

    // ❌ revert on error
    setIsWishlisted(previousState)

    toast.error("Something went wrong ❌")
  }
}