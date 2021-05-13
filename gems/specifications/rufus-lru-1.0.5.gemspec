# -*- encoding: utf-8 -*-
# stub: rufus-lru 1.0.5 ruby lib

Gem::Specification.new do |s|
  s.name = "rufus-lru".freeze
  s.version = "1.0.5"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["John Mettraux".freeze]
  s.date = "2012-02-27"
  s.description = "LruHash class, a Hash with a max size, controlled by a LRU mechanism".freeze
  s.email = ["jmettraux@gmail.com".freeze]
  s.homepage = "http://github.com/jmettraux/rufus-lru".freeze
  s.rubyforge_project = "rufus".freeze
  s.rubygems_version = "2.6.14.1".freeze
  s.summary = "A Hash with a max size, controlled by a LRU mechanism".freeze

  s.installed_by_version = "2.6.14.1" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rake>.freeze, [">= 0"])
      s.add_development_dependency(%q<rspec>.freeze, [">= 2.7.0"])
    else
      s.add_dependency(%q<rake>.freeze, [">= 0"])
      s.add_dependency(%q<rspec>.freeze, [">= 2.7.0"])
    end
  else
    s.add_dependency(%q<rake>.freeze, [">= 0"])
    s.add_dependency(%q<rspec>.freeze, [">= 2.7.0"])
  end
end
