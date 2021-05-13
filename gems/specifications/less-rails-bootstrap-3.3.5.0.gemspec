# -*- encoding: utf-8 -*-
# stub: less-rails-bootstrap 3.3.5.0 ruby lib

Gem::Specification.new do |s|
  s.name = "less-rails-bootstrap".freeze
  s.version = "3.3.5.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Ken Collins".freeze]
  s.date = "2015-06-19"
  s.description = "CSS toolkit from Twitter For Rails 3.1+ Asset Pipeline. Best one of all!".freeze
  s.email = ["ken@metaskills.net".freeze]
  s.homepage = "http://github.com/metaskills/less-rails-bootstrap".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.6.14.1".freeze
  s.summary = "CSS toolkit from Twitter For Rails 3.1+ Asset Pipeline".freeze

  s.installed_by_version = "2.6.14.1" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<less-rails>.freeze, ["<= 2.8", ">= 2.6"])
      s.add_development_dependency(%q<minitest>.freeze, [">= 4.0"])
      s.add_development_dependency(%q<guard-minitest>.freeze, [">= 0"])
      s.add_development_dependency(%q<guard>.freeze, [">= 0"])
      s.add_development_dependency(%q<rails>.freeze, ["<= 4.2", ">= 3.1"])
      s.add_development_dependency(%q<appraisal>.freeze, [">= 0"])
    else
      s.add_dependency(%q<less-rails>.freeze, ["<= 2.8", ">= 2.6"])
      s.add_dependency(%q<minitest>.freeze, [">= 4.0"])
      s.add_dependency(%q<guard-minitest>.freeze, [">= 0"])
      s.add_dependency(%q<guard>.freeze, [">= 0"])
      s.add_dependency(%q<rails>.freeze, ["<= 4.2", ">= 3.1"])
      s.add_dependency(%q<appraisal>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<less-rails>.freeze, ["<= 2.8", ">= 2.6"])
    s.add_dependency(%q<minitest>.freeze, [">= 4.0"])
    s.add_dependency(%q<guard-minitest>.freeze, [">= 0"])
    s.add_dependency(%q<guard>.freeze, [">= 0"])
    s.add_dependency(%q<rails>.freeze, ["<= 4.2", ">= 3.1"])
    s.add_dependency(%q<appraisal>.freeze, [">= 0"])
  end
end
