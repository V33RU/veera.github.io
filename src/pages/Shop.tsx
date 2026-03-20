import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SilkscreenLabel from "@/components/SilkscreenLabel";
import eagleCtfImg from "@/assets/shop/eagle-ctf-badge.png";
import iotsrgImg from "@/assets/shop/iotsrg-badge.png";
import playbook1Img from "@/assets/shop/playbook1.png";
import iceBitesImg from "@/assets/shop/ice-bites-kit.png";

const products = [
  {
    name: "Eagle-CTF Badge",
    price: "$6",
    memberPrice: "$5",
    category: "Badge",
    image: eagleCtfImg,
  },
  {
    name: "IoTSRG Badge",
    price: "$3",
    memberPrice: "$1",
    category: "Badge",
    image: iotsrgImg,
  },
  {
    name: "Playbook1 - Hardware Debug Pins",
    price: "$5",
    memberPrice: null,
    category: "Book",
    image: playbook1Img,
  },
  {
    name: "ICE-Bites Kit",
    price: "$50",
    memberPrice: "$30",
    category: "Kit",
    image: iceBitesImg,
  },
];

const Shop = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SilkscreenLabel designator="Q1" label="shop" className="mb-2" />
      <p className="text-muted-foreground text-sm mb-8">
        Gadgets, books, and extras — tools of the trade for hardware hackers.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {products.map((item, i) => (
          <motion.a
            key={item.name}
            href="https://buymeacoffee.com/v33ru/extras"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-border rounded-lg p-5 bg-secondary/10 hover:border-primary/40 transition-colors flex flex-col group cursor-pointer"
          >
            <div className="w-full h-36 mb-3 rounded overflow-hidden bg-secondary/20 flex items-center justify-center">
              <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
            </div>
            <Badge variant="secondary" className="text-xs w-fit mb-3">{item.category}</Badge>
            <h2 className="text-primary font-semibold text-base mb-3 group-hover:underline">{item.name}</h2>
            <div className="mt-auto flex items-end justify-between">
              <div>
                <span className="text-foreground font-bold text-lg">{item.price}</span>
                {item.memberPrice && (
                  <p className="text-muted-foreground text-xs mt-1">
                    {item.memberPrice} for members
                  </p>
                )}
              </div>
              <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border border-primary/30 rounded-lg p-6 bg-primary/5 text-center"
      >
        <ShoppingBag className="mx-auto text-primary mb-3" size={32} />
        <p className="text-foreground text-sm mb-4">
          All items are available on my Buy Me a Coffee Extras page.
        </p>
        <a
          href="https://buymeacoffee.com/v33ru/extras"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Browse Shop <ExternalLink size={14} />
        </a>
      </motion.div>
    </div>
  );
};

export default Shop;
